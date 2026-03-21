/**
 * Converts raw UN/LOCODE CSV files (Latin-1 encoded) into a compact data.json.
 *
 * CSV columns (0-indexed, no header row):
 *   [00] change indicator
 *   [01] country
 *   [02] location
 *   [03] name (diacritics)
 *   [04] name (ASCII)
 *   [05] subdivision
 *   [06] function classifier
 *   [07] status
 *   [08] date
 *   [09] IATA code
 *   [10] coordinates
 *
 * Rows with change indicator "=" are reference entries (exonym ↔ local name mappings).
 */
import { existsSync } from 'node:fs';
import { readFile, readdir, writeFile } from 'node:fs/promises';
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

/**
 * Maps function classifier string positions to typed function codes.
 * Position 7 accepts both 'B' and '8' for border crossing (legacy encoding).
 */
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

/**
 * Parses a "DDMMhDDDMMh" coordinate string into decimal lat/lon.
 * Returns null if the value is absent or does not match the expected format.
 */
function parseCoordinates(value: string): UnlocodeEntry['coordinates'] {
  const compact = value.toUpperCase().replace(/\s+/g, '');
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

/**
 * Scans src/data/raw/ for versioned Part1 CSVs and returns the most recent
 * release string (e.g. "2024-2"), or undefined if none are found.
 */
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

/**
 * Decodes the 8-character function classifier string into typed function codes.
 * Unknown characters are collected for a warning but do not abort the build.
 */
function parseFunctions(classifier: string, unknownClassifiers: Set<string>): UnlocodeFunctionCode[] {
  const result: UnlocodeFunctionCode[] = [];
  const normalized = classifier.padEnd(8, '-').slice(0, 8).toUpperCase();

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

  // Last-write wins across the three CSV parts: later parts may update or supersede earlier entries.
  const entriesByCode = new Map<string, DataEntry>();
  const unknownStatuses = new Set<string>();
  const unknownClassifiers = new Set<string>();
  // Reference rows (change indicator "=") link exonyms/historic names to current local names.
  // Collected in a first pass; resolved against entriesByCode in a second pass below.
  const referenceRows: { country: string; raw3: string; raw4: string }[] = [];

  const clean = (value: string | undefined): string => (value ?? '').trim();

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
      // Reference entry: maps an exonym or historic name to a current local name.
      // Captured for the second pass; not a locatable entry itself.
      if (clean(row[0]) === '=') {
        const refCountry = clean(row[1]).toUpperCase();
        const raw4 = clean(row[4]);
        const raw3 = clean(row[3]);
        if (refCountry && (raw3.includes(' = ') || raw4.includes(' = ')))
          referenceRows.push({ country: refCountry, raw3, raw4 });
        continue;
      }

      const country = clean(row[1]).toUpperCase();
      const location = clean(row[2]).toUpperCase();
      const name = clean(row[4] || row[3]);
      const name_native = clean(row[3]);
      const subdivision = clean(row[5]).toUpperCase();
      const status = clean(row[7]).toUpperCase();
      const iata = clean(row[9]).toUpperCase();
      const coordinates = parseCoordinates(clean(row[10]));

      // Skip country headers and alias/metadata rows.
      if (!country || !location || !name || name.startsWith('.')) continue;
      if (country.length !== 2 || location.length !== 3) continue;
      if (!status) continue;
      if (!KNOWN_STATUS_CODES.has(status)) {
        unknownStatuses.add(status);
        continue;
      }

      const functions = parseFunctions(clean(row[6]), unknownClassifiers);
      const code = `${country}${location}`;

      entriesByCode.set(code, {
        country,
        location,
        name,
        ...(name_native && name_native !== name ? { name_native } : {}),
        ...(iata ? { iata } : {}),
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

  // Second pass: resolve reference rows and attach exonyms to their entries.
  // name is always ASCII (row[4]) so the index key uses the ASCII local name.
  const nameIndex = new Map<string, string>(); // "COUNTRY:name" → code
  for (const [code, entry] of entriesByCode) {
    nameIndex.set(`${entry.country}:${entry.name}`, code);
  }
  for (const { country, raw3, raw4 } of referenceRows) {
    const sepIdx = raw4.indexOf(' = ');
    if (sepIdx === -1) continue;
    const localName = raw4
      .slice(sepIdx + 3)
      .trim()
      .replace(/\s*\(.*\)$/, '')
      .trim();
    const code = nameIndex.get(`${country}:${localName}`);
    if (!code) continue;
    const entry = entriesByCode.get(code)!;
    // Both raw4 (ASCII) and raw3 (diacritics) may carry distinct exonyms on the left of " = ".
    // Deduplicate so identical forms (e.g. "Copenhagen" in both columns) are stored only once.
    const candidates = [raw4, raw3].map((raw) => raw.slice(0, raw.indexOf(' = ')).trim());
    const newExonyms = [...new Set(candidates)].filter(Boolean);
    if (!entry.exonyms) entry.exonyms = [];
    for (const exonym of newExonyms) {
      if (!entry.exonyms.includes(exonym)) entry.exonyms.push(exonym);
    }
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

  type Meta = { datasetVersion?: string; generatedAt?: string };
  const outputContent = lines.join('\n');
  let previousMeta = existsSync(META_OUTPUT_FILE)
    ? (JSON.parse(await readFile(META_OUTPUT_FILE, 'utf8')) as Meta)
    : undefined;
  const previousOutput = existsSync(OUTPUT_FILE) ? await readFile(OUTPUT_FILE, 'utf8') : undefined;
  const changed = previousMeta?.datasetVersion !== selectedRelease || previousOutput !== outputContent;
  if (changed) {
    await writeFile(OUTPUT_FILE, outputContent, 'utf8');
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
  }

  if (unknownClassifiers.size > 0) {
    console.warn(
      `Warning: unknown function classifier characters seen (${Array.from(unknownClassifiers).sort().join(', ')}).`,
    );
  }

  console.log(`${changed ? 'Converted' : 'Checked'} ${partFiles.length} files (${selectedRelease}) -> ${OUTPUT_FILE}`);
  console.log(
    changed
      ? `Wrote dataset metadata -> ${META_OUTPUT_FILE}`
      : `Skipped dataset metadata -> ${META_OUTPUT_FILE} (no changes detected)`,
  );
  console.log(`Wrote ${entries.length.toLocaleString()} entries`);
}

await main();
