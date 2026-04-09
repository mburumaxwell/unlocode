import { getSiteUrl } from './environment';

const siteUrl = getSiteUrl({ defaultValue: 'https://unlocode.vercel.app' });

export const config = {
  siteUrl,
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
