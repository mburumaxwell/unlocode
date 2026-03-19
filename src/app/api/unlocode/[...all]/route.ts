import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { z } from 'zod';

import { getDatasetMeta, getEntryByCode, searchUnlocodeDatabase } from '@/data';
import { UnlocodeFunctionCodeSchema } from '@/lib/unlocode';

/**
 * Unified UN/LOCODE API routes
 * - GET /api/unlocode/meta
 * - GET /api/unlocode/search
 * - GET /api/unlocode/:code
 */
const app = new Hono().basePath('/api/unlocode');

app.use('*', async (c, next) => {
  await next();
  c.header('Access-Control-Allow-Origin', '*');
});

const countryCodeSchema = z
  .string()
  .trim()
  .regex(/^[A-Z]{2}$/, 'Invalid country code. Use ISO 3166-1 alpha-2 (e.g. US, GB, DE).');

const searchQuerySchema = z.object({
  q: z.string().optional().default(''),
  country: countryCodeSchema
    .or(z.array(countryCodeSchema))
    .optional()
    .transform((value) => {
      if (value === undefined) return undefined;
      return Array.isArray(value) ? value : [value];
    }),
  function: UnlocodeFunctionCodeSchema.or(z.array(UnlocodeFunctionCodeSchema))
    .optional()
    .transform((value) => {
      if (value === undefined) return undefined;
      return Array.isArray(value) ? value : [value];
    }),
  limit: z.coerce.number().int().min(1).max(200).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

app.get('/search', zValidator('query', searchQuerySchema), (c) => {
  const { q, country: countries, function: functions, limit, offset } = c.req.valid('query');

  const { results, total } = searchUnlocodeDatabase({
    query: q,
    countries,
    functions,
    limit,
    offset,
  });

  c.header('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  return c.json({ results, total, limit, offset });
});

app.get('/meta', (c) => {
  c.header('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
  return c.json(getDatasetMeta());
});

app.get('/:code', zValidator('param', z.object({ code: z.string().trim().min(1) })), (c) => {
  const { code } = c.req.valid('param');
  const entry = getEntryByCode(code.toUpperCase());

  if (!entry) return c.body(null, 204);

  c.header('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  return c.json(entry);
});

app.options('*', (c) => c.body(null, 204));

export const GET = handle(app);
export const OPTIONS = handle(app);
