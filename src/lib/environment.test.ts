import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

describe('getSiteUrl', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  test('development uses correct URL', async () => {
    // ensure no influence from Vercel build
    delete process.env.VERCEL_GIT_COMMIT_REF;
    delete process.env.VERCEL_GIT_COMMIT_SHA;
    delete process.env.VERCEL_BRANCH_URL;

    // @ts-expect-error -- IGNORE ---
    process.env.NODE_ENV = 'development';
    expect(process.env.NODE_ENV).toBe('development');
    process.env.GITHUB_REF_NAME = 'main';
    process.env.GITHUB_SHA = 'abc123';

    const { getSiteUrl } = await import('./environment');
    process.env.PORTLESS_URL = 'https://unlocode.localhost';
    expect(getSiteUrl({ defaultValue: 'https://contoso.com' })).toBe('https://unlocode.localhost');
    delete process.env.PORTLESS_URL;

    process.env.PORT = '3000';
    expect(getSiteUrl({ defaultValue: 'https://contoso.com' })).toBe('http://localhost:3000');
    delete process.env.PORT;
  });

  test('main uses default value', async () => {
    // ensure no influence from Vercel build
    delete process.env.VERCEL_GIT_COMMIT_REF;
    delete process.env.VERCEL_GIT_COMMIT_SHA;
    delete process.env.VERCEL_BRANCH_URL;

    // @ts-expect-error -- IGNORE ---
    process.env.NODE_ENV = 'production';
    process.env.GITHUB_REF_NAME = 'main';
    process.env.GITHUB_SHA = 'abc123';
    const { getSiteUrl } = await import('./environment');
    expect(getSiteUrl({ defaultValue: 'https://contoso.com' })).toBe('https://contoso.com');
  });

  test('non-main uses correct value', async () => {
    // ensure no influence from GitHub Actions
    delete process.env.GITHUB_REF_NAME;
    delete process.env.GITHUB_SHA;

    // @ts-expect-error -- IGNORE ---
    process.env.NODE_ENV = 'production';
    process.env.VERCEL_GIT_COMMIT_REF = 'dependabot/npm_and_yarn-360aad';
    process.env.VERCEL_GIT_COMMIT_SHA = 'abc123';
    process.env.VERCEL_BRANCH_URL = 'my-branch-unlocode.vercel.app/';
    const { getSiteUrl } = await import('./environment');
    expect(getSiteUrl({ defaultValue: 'https://contoso.com' })).toBe('https://my-branch-unlocode.vercel.app/');
    delete process.env.VERCEL_BRANCH_URL;

    // fallback
    expect(getSiteUrl({ defaultValue: 'https://contoso.com' })).toBe('https://contoso.com');
    delete process.env.VERCEL_GIT_COMMIT_REF;
    delete process.env.VERCEL_GIT_COMMIT_SHA;
  });
});
