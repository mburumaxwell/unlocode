'use client';

import { PlayIcon } from 'lucide-react';
import * as React from 'react';
import { CodeBlock } from '@/components/code-block';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { config } from '@/lib/site';

export default function DocsPage() {
  return (
    <main className='min-h-[calc(100vh-3.5rem)]'>
      <div className='mx-auto max-w-3xl px-4 py-8'>
        <div className='mb-8'>
          <h1 className='text-lg font-semibold text-foreground'>UN/LOCODE API Reference</h1>
          <p className='text-sm text-muted-foreground mt-1'>
            Public REST API for searching and looking up{' '}
            <a
              href='https://unece.org/trade/cefact/unlocode-code-list-country-and-territory'
              target='_blank'
              rel='noopener noreferrer'
              className='underline underline-offset-2 hover:text-foreground transition-colors'
            >
              UN/LOCODE
            </a>{' '}
            entries. Endpoints support CORS.
          </p>
        </div>

        <div className='flex flex-col gap-10'>
          <p className='text-sm text-muted-foreground leading-relaxed'>
            Base URL:{' '}
            <code className='rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground'>{`${config.siteUrl}/api/unlocode`}</code>
            . All responses include{' '}
            <code className='rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground'>
              Access-Control-Allow-Origin: *
            </code>{' '}
            so you can call these from any origin.
          </p>

          <Separator />

          {/* GET /api/unlocode/search */}
          <EndpointSection
            method='GET'
            path='/api/unlocode/search'
            description='Search the UN/LOCODE database. Returns paginated results filtered by text query, country, and/or function.'
            params={[
              { name: 'q', type: 'string', description: 'Text search across name, code, and country code. Optional.' },
              {
                name: 'country',
                type: 'string',
                description:
                  'ISO 3166-1 alpha-2 code. Repeatable for OR filtering (e.g. country=US&country=CA). Optional.',
              },
              {
                name: 'function',
                type: 'string',
                description: 'Repeatable query param (e.g. function=port&function=airport). Optional.',
              },
              { name: 'limit', type: 'number', description: 'Max results per page. Default 50, max 200.' },
              { name: 'offset', type: 'number', description: 'Pagination offset. Default 0.' },
            ]}
            exampleRequest={`curl "${config.siteUrl}/api/unlocode/search?q=rotterdam&country=NL&limit=5"`}
            exampleResponse={`{
  "results": [
    {
      "code": "NLRTM",
      "name": "Rotterdam",
      "country": "NL",
      "subdivision": "ZH",
      "functions": ["port", "rail_terminal", "road_terminal", "airport"],
      "coordinates": { "lat": 51.916667, "lon": 4.483333 },
      "status": "AI"
    }
  ],
  "total": 1,
  "limit": 5,
  "offset": 0
}`}
            tryItPath={`${config.siteUrl}/api/unlocode/search?q=rotterdam&country=NL&limit=3`}
          />

          <Separator />

          {/* GET /api/unlocode/meta */}
          <EndpointSection
            method='GET'
            path='/api/unlocode/meta'
            description='Return metadata for the loaded UN/LOCODE dataset.'
            params={[]}
            exampleRequest={`curl "${config.siteUrl}/api/unlocode/meta"`}
            exampleResponse={`{
  "datasetVersion": "2024-2",
  "generatedAt": "2026-02-22T00:00:00.000Z"
}`}
            tryItPath={`${config.siteUrl}/api/unlocode/meta`}
          />

          <Separator />

          {/* GET /api/unlocode/:code */}
          <EndpointSection
            method='GET'
            path='/api/unlocode/:code'
            description='Look up a single entry by its UN/LOCODE. Case-insensitive. Returns 204 when the code is not found.'
            params={[{ name: 'code', type: 'path', description: 'The UN/LOCODE, e.g. USNYC, GBLON, SGSIN.' }]}
            exampleRequest={`curl "${config.siteUrl}/api/unlocode/USNYC"`}
            exampleResponse={`{
  "code": "USNYC",
  "name": "New York",
  "country": "US",
  "subdivision": "NY",
  "functions": ["port", "rail_terminal", "road_terminal", "airport", "postal_exchange"],
  "coordinates": { "lat": 40.7, "lon": -74.0 },
  "status": "AI"
}`}
            tryItPath={`${config.siteUrl}/api/unlocode/USNYC`}
          />

          <Separator />

          {/* Notes */}
          <section>
            <h2 className='text-sm font-semibold text-foreground mb-3'>Notes</h2>
            <ul className='flex flex-col gap-2 text-sm text-muted-foreground'>
              <li className='flex gap-2'>
                <span className='text-muted-foreground/50 select-none'>--</span>
                <span>
                  Data is generated from official UNECE UN/LOCODE CSV releases and loaded from JSON for fast local
                  lookup.
                </span>
              </li>
              <li className='flex gap-2'>
                <span className='text-muted-foreground/50 select-none'>--</span>
                <span>Search is case-insensitive and matches against the location name, code, and country code.</span>
              </li>
              <li className='flex gap-2'>
                <span className='text-muted-foreground/50 select-none'>--</span>
                <span>
                  <code className='rounded bg-muted px-1 py-0.5 font-mono text-xs text-foreground'>GET /:code</code>{' '}
                  returns <code className='rounded bg-muted px-1 py-0.5 font-mono text-xs text-foreground'>204</code>{' '}
                  when no matching entry exists.
                </span>
              </li>
              <li className='flex gap-2'>
                <span className='text-muted-foreground/50 select-none'>--</span>
                <span>Lookup responses are cached with a longer TTL than search responses.</span>
              </li>
              <li className='flex gap-2'>
                <span className='text-muted-foreground/50 select-none'>--</span>
                <span>
                  <code className='rounded bg-muted px-1 py-0.5 font-mono text-xs text-foreground'>GET /meta</code>{' '}
                  reports the loaded dataset version and generation timestamp.
                </span>
              </li>
              <li className='flex gap-2'>
                <span className='text-muted-foreground/50 select-none'>--</span>
                <span>
                  <code className='rounded bg-muted px-1 py-0.5 font-mono text-xs text-foreground'>coordinates</code>{' '}
                  are normalized to decimal latitude/longitude values, or{' '}
                  <code className='rounded bg-muted px-1 py-0.5 font-mono text-xs text-foreground'>null</code> when not
                  available in source data.
                </span>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}

/* ------------------------------------------------------------------ */
/* Endpoint section component                                          */
/* ------------------------------------------------------------------ */

interface Param {
  name: string;
  type: string;
  description: string;
}

function EndpointSection({
  method,
  path,
  description,
  params,
  exampleRequest,
  exampleResponse,
  tryItPath,
}: {
  method: string;
  path: string;
  description: string;
  params: Param[];
  exampleRequest: string;
  exampleResponse: string;
  tryItPath: string;
}) {
  return (
    <section className='flex flex-col gap-4'>
      <div className='flex items-center gap-2'>
        <Badge variant='outline' className='font-mono text-[10px] font-semibold tracking-wider'>
          {method}
        </Badge>
        <code className='font-mono text-sm text-foreground'>{path}</code>
      </div>

      <p className='text-sm text-muted-foreground'>{description}</p>

      {params.length > 0 && (
        <div className='rounded-lg border overflow-hidden'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b bg-muted/50'>
                <th className='px-3 py-2 text-left font-medium text-muted-foreground text-xs'>Parameter</th>
                <th className='px-3 py-2 text-left font-medium text-muted-foreground text-xs'>Type</th>
                <th className='px-3 py-2 text-left font-medium text-muted-foreground text-xs'>Description</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border'>
              {params.map((p) => (
                <tr key={p.name}>
                  <td className='px-3 py-2 font-mono text-xs text-foreground'>{p.name}</td>
                  <td className='px-3 py-2 text-xs text-muted-foreground'>{p.type}</td>
                  <td className='px-3 py-2 text-xs text-muted-foreground'>{p.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className='flex flex-col gap-3'>
        <CodeBlock label='Request' code={exampleRequest} language='bash' />
        <CodeBlock label='Response' code={exampleResponse} language='json' />
      </div>

      <TryIt path={tryItPath} />
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Try it live                                                         */
/* ------------------------------------------------------------------ */

function TryIt({ path }: { path: string }) {
  const [response, setResponse] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const run = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    try {
      const res = await fetch(path);
      if (res.status === 204) {
        setResponse('No content (204)');
        return;
      }
      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex flex-col gap-2'>
      <Button variant='outline' size='sm' onClick={run} disabled={loading} className='w-fit gap-2'>
        {loading ? <Spinner className='size-3' /> : <PlayIcon className='size-3' />}
        Try it
      </Button>

      {error && (
        <div className='rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive font-mono'>
          {error}
        </div>
      )}

      {response && <CodeBlock label='Response' code={response} language='json' codeContainerClassName='max-h-75' />}
    </div>
  );
}
