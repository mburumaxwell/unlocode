import { ArrowRightIcon, ExternalLinkIcon } from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';

import { CodeBlock } from '@/components/code-block';
import { config } from '@/lib/site';

export default function HomePage() {
  const quickStartExample = `# Search for ports in the Netherlands
curl "${config.siteUrl}/api/unlocode/search?country=NL&function=port&limit=5"

# Look up a single code
curl "${config.siteUrl}/api/unlocode/NLRTM"`;

  return (
    <main className='min-h-[calc(100vh-3.5rem)]'>
      <div className='mx-auto max-w-2xl px-4 py-16'>
        {/* Hero */}
        <header className='mb-14'>
          <p className='mb-3 font-mono text-xs text-muted-foreground'>unlocode/</p>
          <h1 className='mb-4 text-2xl font-semibold tracking-tight text-balance text-foreground'>
            Search, API, and React components for UN/LOCODE
          </h1>
          <p className='max-w-lg text-sm leading-relaxed text-muted-foreground'>
            An open-source toolkit for the{' '}
            <a
              href='https://unece.org/trade/cefact/unlocode-code-list-country-and-territory'
              target='_blank'
              rel='noopener noreferrer'
              className='underline underline-offset-2 transition-colors hover:text-foreground'
            >
              United Nations Code for Trade and Transport Locations
              <ExternalLinkIcon className='ml-0.5 inline-block size-3 -translate-y-px' />
            </a>
            . Search the full dataset, call the REST API from any client, or drop the React component into your forms.
          </p>
        </header>

        {/* Navigation */}
        <nav className='mb-14 flex flex-col gap-px overflow-hidden rounded-lg border' aria-label='Sections'>
          <NavRow
            href='/search'
            title='Search'
            description='Filter by country, function type, and free text. Click a result to see full details.'
          />
          <NavRow
            href='/component'
            title='Component'
            description='A compact combobox for forms. Select, display, and clear a UN/LOCODE value.'
          />
          <NavRow
            href='/docs'
            title='API Reference'
            description='Public REST endpoints for search and lookup. CORS enabled.'
          />
        </nav>

        {/* What is UN/LOCODE */}
        <section className='mb-12'>
          <h2 className='mb-3 text-sm font-semibold text-foreground'>What is UN/LOCODE?</h2>
          <p className='mb-3 text-sm leading-relaxed text-muted-foreground'>
            UN/LOCODE is a geographic coding scheme maintained by the{' '}
            <a
              href='https://unece.org/trade/uncefact'
              target='_blank'
              rel='noopener noreferrer'
              className='underline underline-offset-2 transition-colors hover:text-foreground'
            >
              United Nations Economic Commission for Europe (UNECE)
              <ExternalLinkIcon className='ml-0.5 inline-block size-3 -translate-y-px' />
            </a>
            . It assigns a unique 5-character code to locations across 249 countries and territories that are
            significant for international trade and transport: ports, airports, rail terminals, road terminals, postal
            exchange offices, inland clearance depots, and border crossings.
          </p>
          <p className='mb-3 text-sm leading-relaxed text-muted-foreground'>
            The code format is{' '}
            <code className='rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground'>CC LOC</code> where{' '}
            <code className='rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground'>CC</code> is the ISO
            3166-1 alpha-2 country code and{' '}
            <code className='rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground'>LOC</code> is a
            3-character location identifier. For example,{' '}
            <code className='rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground'>USNYC</code> is New York
            and <code className='rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground'>NLRTM</code> is
            Rotterdam.
          </p>
          <p className='text-sm leading-relaxed text-muted-foreground'>
            The official dataset is published at{' '}
            <a
              href='https://unece.org/trade/cefact/unlocode-code-list-country-and-territory'
              target='_blank'
              rel='noopener noreferrer'
              className='underline underline-offset-2 transition-colors hover:text-foreground'
            >
              unece.org
              <ExternalLinkIcon className='ml-0.5 inline-block size-3 -translate-y-px' />
            </a>{' '}
            and is updated several times per year.
          </p>
        </section>

        {/* How it works */}
        <section className='mb-12'>
          <h2 className='mb-3 text-sm font-semibold text-foreground'>How this toolkit works</h2>
          <div className='flex flex-col gap-5'>
            <Detail
              title='API'
              items={[
                '2 endpoints: search and lookup by code',
                'Paginated search with text, country, and function filters',
                'CORS headers on every response: call from any origin',
                'Cache-Control headers for CDN edge caching',
              ]}
            />
            <Detail
              title='Search UI'
              items={[
                'Country combobox + function multi-select in a ButtonGroup, plus free text input',
                'SWR with keepPreviousData to avoid layout flicker during fetches',
                '300ms debounce on text input to limit API calls',
                'Detail panel shows full entry info for the selected result',
              ]}
            />
            <Detail
              title='Form component'
              items={[
                'Compact ButtonGroup with country picker and search popover',
                'Displays the selected UN/LOCODE inline after selection with a clear action',
                'Controlled value + onValueChange interface, works with any form library',
                'Same async search pattern as the search page',
              ]}
            />
          </div>
        </section>

        {/* Quick start */}
        <section className='mb-14'>
          <h2 className='mb-3 text-sm font-semibold text-foreground'>Quick start</h2>
          <CodeBlock code={quickStartExample} language='bash' />
        </section>

        <footer className='flex flex-col gap-2 border-t pt-6 text-xs text-muted-foreground'>
          <p>
            This app uses the official UNECE UN/LOCODE dataset generated from source CSV files and refreshed by
            automation.
          </p>
          <p>
            Source code license:{' '}
            <a
              href='https://github.com/mburumaxwell/unlocode/blob/main/LICENSE'
              target='_blank'
              rel='noopener noreferrer'
              className='underline underline-offset-2 transition-colors hover:text-foreground'
            >
              GNU AGPL v3.0
              <ExternalLinkIcon className='ml-0.5 inline-block size-3 -translate-y-px' />
            </a>
          </p>
          <p>
            Data source:{' '}
            <a
              href='https://unece.org/trade/cefact/unlocode-code-list-country-and-territory'
              target='_blank'
              rel='noopener noreferrer'
              className='underline underline-offset-2 transition-colors hover:text-foreground'
            >
              UNECE UN/LOCODE
              <ExternalLinkIcon className='ml-0.5 inline-block size-3 -translate-y-px' />
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}

function NavRow({ href, title, description }: { href: Route; title: string; description: string }) {
  return (
    <Link
      href={href}
      className='group flex items-center justify-between gap-4 bg-card px-4 py-3 transition-colors hover:bg-accent/50'
    >
      <div className='min-w-0'>
        <p className='text-sm font-medium text-foreground'>{title}</p>
        <p className='mt-0.5 text-xs text-muted-foreground'>{description}</p>
      </div>
      <ArrowRightIcon className='size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5' />
    </Link>
  );
}

function Detail({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className='mb-1.5 font-mono text-xs font-medium text-foreground'>{title}</h3>
      <ul className='flex flex-col gap-1'>
        {items.map((item) => (
          <li key={item} className='flex gap-2 text-sm text-muted-foreground'>
            <span className='shrink-0 text-muted-foreground/40 select-none'>--</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
