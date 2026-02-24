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
});
