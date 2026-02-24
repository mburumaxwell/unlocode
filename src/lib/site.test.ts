import { afterEach, describe, expect, it, vi } from 'vitest';

async function loadSiteUrl(): Promise<string> {
  vi.resetModules();
  const { config } = await import('./site');
  return config.siteUrl;
}

describe('config.siteUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('uses localhost in development', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('PORT', '4321');
    vi.stubEnv('VERCEL_BRANCH_URL', '');

    expect(await loadSiteUrl()).toBe('http://localhost:4321');
  });

  it('uses Vercel branch URL outside development when available', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('VERCEL_BRANCH_URL', 'my-branch-unlocode.vercel.app');

    expect(await loadSiteUrl()).toBe('https://my-branch-unlocode.vercel.app');
  });

  it('falls back to the default production URL', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('VERCEL_BRANCH_URL', '');

    expect(await loadSiteUrl()).toBe('https://unlocode.vercel.app');
  });
});
