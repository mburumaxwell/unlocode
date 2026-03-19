import type { MetadataRoute } from 'next';

import { config } from '@/lib/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  type Route = MetadataRoute.Sitemap[number];

  const routesMap = [
    '', // root without trailing slash
    '/search',
    '/component',
    '/docs',
  ].map(
    (route): Route => ({
      url: `${config.siteUrl}${route}`,
      // lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 0.5,
    }),
  );

  return [...routesMap];
}
