export type Environment = {
  /** The current environment. */
  name?: 'development' | 'production' | 'test';

  /** Whether the current environment is development. */
  development: boolean;

  /** Whether the current environment is production. */
  production: boolean;

  /** Whether the current environment is test. */
  test: boolean;

  /** The current commit SHA. */
  sha?: string;

  /** The current branch name. */
  branch?: string;

  /** Whether the current branch is the main branch. */
  main: boolean;
};

function getEnvironment(): Environment {
  function execGitCommand(command: string): string | undefined {
    try {
      const { execSync } = require('node:child_process');
      return execSync(command).toString().trim();
    } catch {
      return undefined;
    }
  }

  const env = process.env.NODE_ENV as Environment['name'];
  const branch =
    process.env.GITHUB_REF_NAME ||
    process.env.VERCEL_GIT_COMMIT_REF ||
    execGitCommand('git rev-parse --abbrev-ref HEAD');
  const sha = process.env.GITHUB_SHA || process.env.VERCEL_GIT_COMMIT_SHA || execGitCommand('git rev-parse HEAD');

  return {
    name: env,
    development: env === 'development',
    production: env === 'production',
    test: env === 'test',
    sha,
    branch,
    main: branch === 'main',
  };
}

export const environment = getEnvironment();

export interface SiteUrlOptions {
  /** The default URL to use if no other URL is found. */
  defaultValue: string;
}

export function getSiteUrl({ defaultValue }: SiteUrlOptions): string {
  const { development, main } = environment;

  // if we are in development, use portless or localhost
  if (development) return process.env.PORTLESS_URL || `http://localhost:${process.env.PORT || 3000}`;

  // if we are on the main branch, use the known URL
  if (main) return defaultValue;

  // if we are on Vercel, use the provided URL
  const value = process.env.VERCEL_BRANCH_URL;
  if (value && value.length > 0) return `https://${value}`;

  return defaultValue; // fallback (edge cases)
}
