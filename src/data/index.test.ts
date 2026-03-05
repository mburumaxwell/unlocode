import { describe, expect, it } from 'vitest';
import { getDatasetMeta, getEntryByCode, searchUnlocodeDatabase } from './index';

describe('data/index', () => {
  it('looks up known codes', () => {
    const entry = getEntryByCode('SGSIN');
    expect(entry).toBeDefined();
    expect(entry?.country).toBe('SG');
    expect(entry?.location).toBe('SIN');
  });

  it('searches codes case-insensitively by query', () => {
    const { results } = searchUnlocodeDatabase({ query: 'sgsin', limit: 10 });
    expect(results.some((r) => r.code === 'SGSIN')).toBe(true);
  });

  it('filters by country', () => {
    const { results, total } = searchUnlocodeDatabase({ countries: ['SG'], limit: 25 });
    expect(total).toBeGreaterThan(0);
    expect(results.every((r) => r.country === 'SG')).toBe(true);
  });

  it('filters by country list (OR semantics)', () => {
    const { results, total } = searchUnlocodeDatabase({ countries: ['SG', 'MY'], limit: 25 });
    expect(total).toBeGreaterThan(0);
    expect(results.every((r) => r.country === 'SG' || r.country === 'MY')).toBe(true);
  });

  it('filters by functions (OR semantics)', () => {
    const { results, total } = searchUnlocodeDatabase({
      countries: ['SG'],
      functions: ['port', 'airport'],
      limit: 25,
    });

    expect(total).toBeGreaterThan(0);
    expect(results.every((r) => r.functions.includes('port') || r.functions.includes('airport'))).toBe(true);
  });

  it('applies pagination with limit and offset', () => {
    const firstPage = searchUnlocodeDatabase({ countries: ['SG'], limit: 5, offset: 0 });
    const secondPage = searchUnlocodeDatabase({ countries: ['SG'], limit: 5, offset: 5 });

    expect(firstPage.total).toBeGreaterThan(5);
    expect(secondPage.total).toBe(firstPage.total);
    expect(firstPage.results).toHaveLength(5);
    expect(secondPage.results).toHaveLength(5);
    expect(secondPage.results[0]?.code).not.toBe(firstPage.results[0]?.code);
  });

  it('exposes dataset metadata', () => {
    const meta = getDatasetMeta();
    expect(meta.datasetVersion).toMatch(/^\d{4}-\d+$/);
    expect(new Date(meta.generatedAt).toString()).not.toBe('Invalid Date');
  });

  it('stores correct name_native for ADEAC (Escàs)', () => {
    const entry = getEntryByCode('ADEAC');
    expect(entry).toBeDefined();
    expect(entry?.name).toBe('Escas');
    expect(entry?.name_native).toBe('Escàs');
  });

  it('stores name_native only when it differs from name', () => {
    // Find any entry that has a name_native field
    const { results } = searchUnlocodeDatabase({ limit: 1000 });
    const withNative = results.filter((r) => r.name_native !== undefined);
    // Every entry with name_native must differ from name
    expect(withNative.every((r) => r.name_native !== r.name)).toBe(true);
  });

  it('searches diacritics names via name_native', () => {
    // Find an entry that has a name_native so we can search it
    const all = searchUnlocodeDatabase({ limit: 100000 });
    const sample = all.results.find((r) => r.name_native);
    if (!sample) {
      // If data.json hasn't been regenerated yet this test is skipped
      return;
    }
    const { results } = searchUnlocodeDatabase({ query: sample.name_native! });
    expect(results.some((r) => r.code === sample.code)).toBe(true);
  });
});
