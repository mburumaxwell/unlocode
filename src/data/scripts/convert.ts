import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { parse } from 'csv-parse/sync';
import {
  type UnlocodeEntry,
  type UnlocodeFunctionCode,
  UnlocodeFunctionCodeSchema,
  UnlocodeStatusCodeSchema,
} from '@/lib/unlocode';

type DataEntry = Omit<UnlocodeEntry, 'code'>;
const RAW_DIR = path.join(process.cwd(), 'src/data/raw');
const OUTPUT_FILE = path.join(process.cwd(), 'src/data/data.json');
const META_OUTPUT_FILE = path.join(process.cwd(), 'src/data/data.meta.json');

type FunctionClassifier = {
  index: number;
  symbol: string;
  code: UnlocodeFunctionCode;
};

const FUNCTION_CLASSIFIERS: FunctionClassifier[] = [
  { index: 0, symbol: '1', code: 'port' },
  { index: 1, symbol: '2', code: 'rail_terminal' },
  { index: 2, symbol: '3', code: 'road_terminal' },
  { index: 3, symbol: '4', code: 'airport' },
  { index: 4, symbol: '5', code: 'postal_exchange' },
  { index: 5, symbol: '6', code: 'multimodal' },
  { index: 6, symbol: '7', code: 'fixed_transport' },
  { index: 7, symbol: 'B', code: 'border_crossing' },
];

const KNOWN_STATUS_CODES = new Set<string>(UnlocodeStatusCodeSchema.options);
const KNOWN_FUNCTION_CODES = new Set<string>(UnlocodeFunctionCodeSchema.options);

function clean(value: string | undefined): string {
  return (value ?? '').trim();
}

function parseCoordinates(value: string | undefined): UnlocodeEntry['coordinates'] {
  const compact = clean(value).toUpperCase().replace(/\s+/g, '');
  if (!compact) return null;

  const match = compact.match(/^(\d{2})(\d{2})([NS])(\d{3})(\d{2})([EW])$/);
  if (!match) return null;

  const latDeg = Number(match[1]);
  const latMin = Number(match[2]);
  const latHem = match[3];
  const lonDeg = Number(match[4]);
  const lonMin = Number(match[5]);
  const lonHem = match[6];

  if (latMin > 59 || lonMin > 59) return null;

  const lat = latDeg + latMin / 60;
  const lon = lonDeg + lonMin / 60;
  const signedLat = latHem === 'S' ? -lat : lat;
  const signedLon = lonHem === 'W' ? -lon : lon;

  return {
    lat: Math.round(signedLat * 1_000_000) / 1_000_000,
    lon: Math.round(signedLon * 1_000_000) / 1_000_000,
  };
}

async function detectLatestRelease(rawDir: string): Promise<string | undefined> {
  const releasePattern = /^(\d{4})-(\d)\s+UNLOCODE CodeListPart1\.csv$/;
  const files = await readdir(rawDir);
  const releases: Array<{ text: string; year: number; issue: number }> = [];

  for (const fileName of files) {
    const match = fileName.match(releasePattern);
    if (!match) continue;
    releases.push({
      text: `${match[1]}-${match[2]}`,
      year: Number(match[1]),
      issue: Number(match[2]),
    });
  }

  releases.sort((a, b) => (a.year !== b.year ? a.year - b.year : a.issue - b.issue));
  return releases.at(-1)?.text;
}

function parseFunctions(classifier: string | undefined, unknownClassifiers: Set<string>): UnlocodeFunctionCode[] {
  const result: UnlocodeFunctionCode[] = [];
  const normalized = clean(classifier).padEnd(8, '-').slice(0, 8).toUpperCase();

  for (const { index, symbol, code } of FUNCTION_CLASSIFIERS) {
    const ch = normalized[index] ?? '-';
    const isBorder = index === 7;
    const isSelected = isBorder ? ch === symbol || ch === '8' : ch === symbol;

    if (isSelected) {
      if (KNOWN_FUNCTION_CODES.has(code)) result.push(code);
      continue;
    }

    if (ch === '-' || ch === '0' || ch === ' ') continue;
    unknownClassifiers.add(`pos${index + 1}:${ch}`);
  }

  return result;
}

async function main() {
  const selectedRelease = await detectLatestRelease(RAW_DIR);

  if (!selectedRelease) {
    throw new Error(`Could not detect release in ${RAW_DIR}. Run data:download first.`);
  }

  const partFiles = [
    `${selectedRelease} UNLOCODE CodeListPart1.csv`,
    `${selectedRelease} UNLOCODE CodeListPart2.csv`,
    `${selectedRelease} UNLOCODE CodeListPart3.csv`,
  ];

  const entriesByCode = new Map<string, DataEntry>();
  const unknownStatuses = new Set<string>();
  const unknownClassifiers = new Set<string>();

  for (const fileName of partFiles) {
    const filePath = path.join(RAW_DIR, fileName);
    const content = await readFile(filePath, 'latin1');
    const rows = parse(content, {
      bom: true,
      columns: false,
      relax_column_count: true,
      relax_quotes: true,
      skip_empty_lines: true,
    }) as string[][];

    for (const row of rows) {
      const country = clean(row[1]).toUpperCase();
      const location = clean(row[2]).toUpperCase();
      const name = clean(row[4] || row[3]);
      const name_native = clean(row[3]);
      const subdivision = clean(row[5]).toUpperCase();
      const status = clean(row[7]).toUpperCase();
      const coordinates = parseCoordinates(row[10]);

      // Skip country headers and alias/metadata rows.
      if (!country || !location || !name || name.startsWith('.')) continue;
      if (country.length !== 2 || location.length !== 3) continue;
      if (!status) continue;
      if (!KNOWN_STATUS_CODES.has(status)) {
        unknownStatuses.add(status);
        continue;
      }

      const functions = parseFunctions(row[6], unknownClassifiers);
      const code = `${country}${location}`;

      entriesByCode.set(code, {
        country,
        location,
        name,
        ...(name_native && name_native !== name ? { name_native } : {}),
        subdivision,
        functions,
        status: UnlocodeStatusCodeSchema.parse(status),
        coordinates,
      });
    }
  }

  if (unknownStatuses.size > 0) {
    throw new Error(
      `Found unknown status codes in raw data: ${Array.from(unknownStatuses).sort().join(', ')}. Update status schema first.`,
    );
  }

  const entries = Array.from(entriesByCode.values()).sort((a, b) => {
    const aCode = `${a.country}${a.location}`;
    const bCode = `${b.country}${b.location}`;
    return aCode.localeCompare(bCode);
  });

  const lines = ['['];
  for (let i = 0; i < entries.length; i += 1) {
    const suffix = i < entries.length - 1 ? ',' : '';
    lines.push(`  ${JSON.stringify(entries[i])}${suffix}`);
  }
  lines.push(']');
  lines.push('');

  await writeFile(OUTPUT_FILE, lines.join('\n'), 'utf8');
  await writeFile(
    META_OUTPUT_FILE,
    `${JSON.stringify(
      {
        datasetVersion: selectedRelease,
        generatedAt: new Date().toISOString(),
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  if (unknownClassifiers.size > 0) {
    console.warn(
      `Warning: unknown function classifier characters seen (${Array.from(unknownClassifiers).sort().join(', ')}).`,
    );
  }

  console.log(`Converted ${partFiles.length} files (${selectedRelease}) -> ${OUTPUT_FILE}`);
  console.log(`Wrote dataset metadata -> ${META_OUTPUT_FILE}`);
  console.log(`Wrote ${entries.length.toLocaleString()} entries`);
}

await main();
