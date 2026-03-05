import type { UnlocodeEntry, UnlocodeFunctionCode } from '@/lib/unlocode';
import locations from './data.json';
import meta from './data.meta.json';

export interface UnlocodeDatasetMeta {
  datasetVersion: string;
  generatedAt: string;
}

// Build the full list with code
const database = (locations as Omit<UnlocodeEntry, 'code'>[]).map(
  (loc): UnlocodeEntry => ({ ...loc, code: `${loc.country}${loc.location}` }),
);
const datasetMeta = meta as UnlocodeDatasetMeta;

// Search function
export function searchUnlocodeDatabase(params: {
  query?: string;
  countries?: string[];
  functions?: UnlocodeFunctionCode[];
  limit?: number;
  offset?: number;
}): { results: UnlocodeEntry[]; total: number } {
  const { query = '', countries, functions, limit = 50, offset = 0 } = params;

  let filtered = database;

  // Filter by countries list (OR semantics)
  if (countries && countries.length > 0) {
    filtered = filtered.filter((e) => countries.includes(e.country));
  }

  // Filter by functions
  if (functions && functions.length > 0) {
    filtered = filtered.filter((e) => functions.some((fc) => e.functions.includes(fc)));
  }

  // Search by query (name, location code, or full UN/LOCODE code)
  if (query.trim()) {
    const q = query.trim().toLowerCase();
    filtered = filtered.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        (e.name_native?.toLowerCase().includes(q) ?? false) ||
        e.location.toLowerCase().includes(q) ||
        e.code.toLowerCase().includes(q) ||
        (e.iata?.toLowerCase().includes(q) ?? false) ||
        `${e.country} ${e.name}`.toLowerCase().includes(q),
    );
  }

  const total = filtered.length;
  const results = filtered.slice(offset, offset + limit);

  return { results, total };
}

export function getEntryByCode(code: string): UnlocodeEntry | undefined {
  return database.find((e) => e.code === code);
}

export function getDatasetMeta(): UnlocodeDatasetMeta {
  return datasetMeta;
}
