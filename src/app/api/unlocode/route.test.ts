import { describe, expect, it } from 'vitest';
import { GET, OPTIONS } from './[route]/route';

function makeRequest(path: string, init?: RequestInit): Request {
  return new Request(`http://localhost:3000/api/unlocode${path}`, init);
}

describe('/api/unlocode route', () => {
  it('returns dataset metadata from GET /meta', async () => {
    const res = await GET(makeRequest('/meta'));
    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toContain('s-maxage=300');

    const body = (await res.json()) as { datasetVersion: string; generatedAt: string };
    expect(body.datasetVersion).toMatch(/^\d{4}-\d+$/);
    expect(new Date(body.generatedAt).toString()).not.toBe('Invalid Date');
  });

  it('returns paginated results from GET /search', async () => {
    const res = await GET(makeRequest('/search?q=rotterdam&country=NL&limit=3'));
    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toContain('s-maxage=60');

    const body = (await res.json()) as {
      results: Array<{ country: string; code: string }>;
      total: number;
      limit: number;
      offset: number;
    };

    expect(body.limit).toBe(3);
    expect(body.offset).toBe(0);
    expect(body.total).toBeGreaterThan(0);
    expect(body.results.length).toBeLessThanOrEqual(3);
    expect(body.results.every((r) => r.country === 'NL')).toBe(true);
  });

  it('supports repeated function query params', async () => {
    const res = await GET(makeRequest('/search?country=SG&function=port&function=airport&limit=10'));
    expect(res.status).toBe(200);

    const body = (await res.json()) as { results: Array<{ functions: string[] }> };
    expect(body.results.length).toBeGreaterThan(0);
    expect(body.results.every((r) => r.functions.includes('port') || r.functions.includes('airport'))).toBe(true);
  });

  it('supports repeated country query params', async () => {
    const res = await GET(makeRequest('/search?country=SG&country=MY&limit=10'));
    expect(res.status).toBe(200);

    const body = (await res.json()) as { results: Array<{ country: string }> };
    expect(body.results.length).toBeGreaterThan(0);
    expect(body.results.every((r) => r.country === 'SG' || r.country === 'MY')).toBe(true);
  });

  it('validates country format on search', async () => {
    const res = await GET(makeRequest('/search?country=sg'));
    expect(res.status).toBe(400);

    const text = await res.text();
    expect(text).toContain('Invalid country code');
  });

  it('returns a code lookup and handles missing values', async () => {
    const found = await GET(makeRequest('/sgsin'));
    expect(found.status).toBe(200);
    expect(found.headers.get('cache-control')).toContain('s-maxage=3600');

    const foundBody = (await found.json()) as { code: string };
    expect(foundBody.code).toBe('SGSIN');

    const missing = await GET(makeRequest('/ZZZZZ'));
    expect(missing.status).toBe(204);
    expect(await missing.text()).toBe('');
  });

  it('responds to OPTIONS', async () => {
    const res = await OPTIONS(makeRequest('/search', { method: 'OPTIONS' }));
    expect(res.status).toBe(204);
  });
});
