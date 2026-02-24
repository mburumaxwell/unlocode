export const config = {
  siteUrl: getSiteUrl(),
  title: 'unlocode - Search, API & React Components',
  description:
    'Open-source toolkit for UN/LOCODE. Search 100k+ trade and transport locations, use the public REST API, or drop the React component into your app.',
  keywords: [
    'UN/LOCODE',
    'UNLOCODE',
    'UNECE',
    'trade locations',
    'transport locations',
    'port codes',
    'airport codes',
    'logistics',
    'shipping',
    'React component',
    'REST API',
  ],
};

function getSiteUrl(): string {
  const development = process.env.NODE_ENV === 'development';
  const defaultValue = 'https://unlocode.vercel.app';

  if (development) return `http://localhost:${process.env.PORT || 3000}`;

  function getBranchFromGit(): string | undefined {
    try {
      if (process.env.NEXT_RUNTIME === 'nodejs') {
        const { execSync } = require('node:child_process');
        return execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
      }
    } catch {
      return undefined;
    }
  }
  const branch = process.env.VERCEL_GIT_COMMIT_REF || getBranchFromGit();

  // if we are on the main branch, use the known URL
  if (branch === 'main') return defaultValue;

  // if we are on Vercel, use the provided URL
  const value = process.env.VERCEL_BRANCH_URL;
  if (value && value.length > 0) return `https://${value}`;

  return defaultValue; // fallback
}
