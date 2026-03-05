'use client';

import { ChevronDownIcon, ExternalLinkIcon, MapPinIcon, SearchIcon, XIcon } from 'lucide-react';
import * as React from 'react';
import { CopyButton } from '@/components/copy-button';
import { CountryCombobox, CountryFlag } from '@/components/country';
import { Badge } from '@/components/ui/badge';
import { ButtonGroup } from '@/components/ui/button-group';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group';
import { Spinner } from '@/components/ui/spinner';
import { UnlocodeFunctionFilter } from '@/components/unlocode-input';
import { useDebounce } from '@/hooks/use-debounce';
import { useUnlocodeSearch } from '@/hooks/use-unlocode-search';
import { getCountry } from '@/lib/countries';
import { UNLOCODE_FUNCTIONS, type UnlocodeEntry, type UnlocodeFunctionCode } from '@/lib/unlocode';
import { cn } from '@/lib/utils';

export default function SearchPage() {
  const [country, setCountry] = React.useState<string | null>(null);
  const [functions, setFunctions] = React.useState<UnlocodeFunctionCode[]>([]);
  const [query, setQuery] = React.useState('');
  const debouncedQuery = useDebounce(query, 300);

  const { results, total, isLoading, isValidating } = useUnlocodeSearch({
    query: debouncedQuery,
    countries: country ? [country] : undefined,
    functions,
  });

  const hasFilters = !!country || !!query || functions.length > 0;

  return (
    <main className='min-h-[calc(100vh-3.5rem)]'>
      <div className='mx-auto max-w-3xl px-4 py-8'>
        <div className='mb-6'>
          <h1 className='text-lg font-semibold text-foreground'>Search UN/LOCODE</h1>
          <p className='text-sm text-muted-foreground'>
            Find trade and transport locations by country, name, code, or function type.
          </p>
        </div>

        <div className='flex flex-col gap-4'>
          {/* Filters */}
          <div className='flex flex-col gap-2 sm:flex-row'>
            <ButtonGroup aria-label='Country and function filters'>
              <CountryCombobox
                value={country}
                onValueChange={(value) => setCountry((value && getCountry(value)?.iso2) || null)}
                className='w-40'
              />
              <UnlocodeFunctionFilter value={functions} onValueChange={setFunctions} className='w-50' />
            </ButtonGroup>

            <InputGroup>
              <InputGroupAddon align='inline-start'>
                <SearchIcon />
              </InputGroupAddon>
              <InputGroupInput
                type='text'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='Search location name or code...'
              />
              <InputGroupAddon align='inline-end'>
                {isValidating && <Spinner />}
                {!isValidating && query && (
                  <InputGroupButton size='icon-xs' variant='ghost' onClick={() => setQuery('')}>
                    <XIcon />
                    <span className='sr-only'>Clear search</span>
                  </InputGroupButton>
                )}
              </InputGroupAddon>
            </InputGroup>
          </div>

          {/* Active filter chips */}
          {hasFilters && (functions.length > 0 || country) && (
            <div className='flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground'>
              <span>Active:</span>
              {country && (
                <button
                  type='button'
                  onClick={() => setCountry(null)}
                  className='inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-secondary-foreground hover:bg-secondary/80 transition-colors'
                >
                  <CountryFlag countryCode={country} className='size-2' /> {country}
                  <XIcon className='size-3' />
                </button>
              )}
              {functions.map((fc) => {
                const fn = UNLOCODE_FUNCTIONS.find((f) => f.code === fc);
                return (
                  <button
                    key={fc}
                    type='button'
                    onClick={() => setFunctions(functions.filter((f) => f !== fc))}
                    className='inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-secondary-foreground hover:bg-secondary/80 transition-colors'
                  >
                    {fn?.label ?? fc}
                    <XIcon className='size-3' />
                  </button>
                );
              })}
            </div>
          )}

          {/* Results */}
          <ResultsList
            results={results}
            total={total}
            isLoading={isLoading}
            isValidating={isValidating}
            hasFilters={hasFilters}
          />
        </div>
      </div>
    </main>
  );
}

function ResultsList({
  results,
  total,
  isLoading,
  isValidating,
  hasFilters,
}: {
  results: UnlocodeEntry[];
  total: number;
  isLoading: boolean;
  isValidating: boolean;
  hasFilters: boolean;
}) {
  const [openCodes, setOpenCodes] = React.useState<string[]>([]);
  const setCodeOpen = (code: string, open: boolean) => {
    setOpenCodes((prev) => {
      if (open) {
        return prev.includes(code) ? prev : [...prev, code];
      }
      return prev.filter((current) => current !== code);
    });
  };

  if (isLoading && results.length === 0) {
    return (
      <div className='flex items-center justify-center py-12 gap-2 text-muted-foreground'>
        <Spinner />
        <span className='text-sm'>Searching...</span>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-12 text-center'>
        <MapPinIcon className='size-10 text-muted-foreground/30 mb-3' />
        <p className='text-sm text-muted-foreground'>
          {hasFilters ? 'No locations match your filters.' : 'Start typing or select a country to search.'}
        </p>
      </div>
    );
  }

  return (
    <div className='flex flex-col'>
      <div className='flex items-center justify-between px-1 py-1.5 text-xs text-muted-foreground'>
        <span>
          {results.length} of {total.toLocaleString()}
        </span>
        {isValidating && <Spinner className='size-3' />}
      </div>
      <div className='divide-y divide-border rounded-lg border overflow-hidden'>
        {results.map((entry) => {
          const isOpen = openCodes.includes(entry.code);

          return (
            <Collapsible key={entry.code} open={isOpen} onOpenChange={(open) => setCodeOpen(entry.code, open)}>
              <CollapsibleTrigger
                type='button'
                className={cn(
                  'flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors hover:bg-accent/50',
                  isOpen && 'bg-accent/40',
                )}
              >
                <CountryFlag countryCode={entry.country} className='mt-0.5 size-4' shape='circle' />
                <div className='flex min-w-0 flex-1 flex-col gap-1'>
                  <div className='flex items-center gap-2'>
                    <span className='font-mono text-sm font-semibold tracking-wide text-foreground'>{entry.code}</span>
                    <span className='truncate text-sm text-foreground'>{entry.name}</span>
                    {entry.subdivision && <span className='text-xs text-muted-foreground'>({entry.subdivision})</span>}
                  </div>
                  <div className='flex flex-wrap gap-1'>
                    {entry.functions.map((fc) => {
                      const fn = UNLOCODE_FUNCTIONS.find((f) => f.code === fc);
                      return (
                        <Badge key={fc} variant='outline' className='px-1.5 py-0 text-[10px] font-normal'>
                          {fn?.label ?? fc}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
                <ChevronDownIcon
                  className={cn(
                    'mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform',
                    isOpen && 'rotate-180',
                  )}
                />
              </CollapsibleTrigger>
              <CollapsibleContent className='border-t px-3 py-3'>
                <UnlocodeDetail entry={entry} />
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>
    </div>
  );
}

function UnlocodeDetail({ entry }: { entry: UnlocodeEntry }) {
  const country = getCountry(entry.country);
  const mapsLink = entry.coordinates
    ? `https://www.google.com/maps/search/?api=1&query=${entry.coordinates.lat},${entry.coordinates.lon}`
    : undefined;

  return (
    <dl className='grid grid-cols-2 gap-x-4 gap-y-2 text-sm lg:grid-cols-5'>
      <div className='space-y-0.5'>
        <dt className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>Status</dt>
        <Badge variant='outline' className='w-fit font-mono text-[10px]'>
          {entry.status}
        </Badge>
      </div>

      <div className='min-w-0 space-y-0.5'>
        <dt className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>Country</dt>
        <dd className='truncate'>{country?.name ?? entry.country}</dd>
      </div>

      <div className='space-y-0.5'>
        <dt className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>Location Code</dt>
        <dd className='font-mono text-xs'>{entry.location}</dd>
      </div>

      <div className='space-y-0.5'>
        <dt className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>UN/LOCODE</dt>
        <dd className='flex items-center gap-1.5'>
          <span className='font-mono text-xs'>{entry.code}</span>
          <CopyButton label='UN/LOCODE' value={entry.code} size='icon-xs' className='size-5' />
        </dd>
      </div>

      <div className='min-w-0 space-y-0.5'>
        <dt className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>Native Name</dt>
        {entry.name_native && <dd>{entry.name_native}</dd>}
        {!entry.name_native && <dd>-</dd>}
      </div>

      <div className='space-y-0.5 col-span-2'>
        <dt className='inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-muted-foreground'>
          <MapPinIcon className='size-3' />
          Coordinates
        </dt>
        {entry.coordinates ? (
          <dd className='flex flex-wrap items-center gap-2.5'>
            <span className='font-mono text-xs text-muted-foreground'>
              {entry.coordinates.lat}, {entry.coordinates.lon}
            </span>
            <a
              href={mapsLink}
              target='_blank'
              rel='noreferrer noopener'
              className='inline-flex items-center gap-1 text-xs text-primary hover:underline underline-offset-4'
            >
              Open in Google Maps
              <ExternalLinkIcon className='size-3' />
            </a>
          </dd>
        ) : (
          <dd className='text-muted-foreground'>Coordinates unavailable</dd>
        )}
      </div>

      {entry.iata && (
        <div className='space-y-0.5'>
          <dt className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>IATA Code</dt>
          <dd className='font-mono text-xs'>{entry.iata}</dd>
        </div>
      )}
    </dl>
  );
}
