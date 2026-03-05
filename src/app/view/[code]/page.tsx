import { ExternalLinkIcon, MapPinIcon } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CopyButton } from '@/components/copy-button';
import { CountryFlag } from '@/components/country';
import { Badge } from '@/components/ui/badge';
import { getEntryByCode } from '@/data';
import { getCountry } from '@/lib/countries';
import { UNLOCODE_FUNCTIONS, type UnlocodeEntry } from '@/lib/unlocode';

export async function generateMetadata(props: PageProps<'/view/[code]'>): Promise<Metadata> {
  const { code } = await props.params;
  const entry = getEntryByCode(code.toUpperCase());

  if (!entry) {
    return { title: `${code} — UN/LOCODE` };
  }

  const country = getCountry(entry.country);
  return {
    title: `${entry.code} — ${entry.name}${entry.subdivision ? `, ${entry.subdivision}` : ''} — UN/LOCODE`,
    description: `UN/LOCODE details for ${entry.name} (${entry.code})${country ? ` in ${country.name}` : ''}.`,
  };
}

export default async function ViewLocodePage(props: PageProps<'/view/[code]'>) {
  const { code } = await props.params;
  const entry = getEntryByCode(code.toUpperCase());

  if (!entry) {
    notFound();
  }

  return (
    <main className='min-h-[calc(100vh-3.5rem)]'>
      <div className='mx-auto max-w-2xl px-4 py-8'>
        <div className='mb-6 flex items-start gap-3'>
          <CountryFlag countryCode={entry.country} className='size-6' shape='circle' />
          <div>
            <p className='font-mono text-xs text-muted-foreground mb-1'>{entry.code}</p>
            <h1 className='text-xl font-semibold tracking-tight text-foreground'>
              {entry.name}
              {entry.subdivision && (
                <span className='ml-2 text-base font-normal text-muted-foreground'>({entry.subdivision})</span>
              )}
            </h1>
            <div className='mt-1.5 flex flex-wrap gap-1'>
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
        </div>

        <div className='rounded-lg border overflow-hidden'>
          <UnlocodeDetailPanel entry={entry} />
        </div>
      </div>
    </main>
  );
}

function UnlocodeDetailPanel({ entry }: { entry: UnlocodeEntry }) {
  const country = getCountry(entry.country);
  const mapsLink = entry.coordinates
    ? `https://www.google.com/maps/search/?api=1&query=${entry.coordinates.lat},${entry.coordinates.lon}`
    : undefined;

  const rows: { label: string; content: React.ReactNode }[] = [
    ...(entry.name_native
      ? [
          {
            label: 'Native Name',
            content: <span>{entry.name_native}</span>,
          },
        ]
      : []),
    ...(entry.exonyms && entry.exonyms.length > 0
      ? [
          {
            label: 'Also known as',
            content: <span>{entry.exonyms.join(', ')}</span>,
          },
        ]
      : []),
    {
      label: 'UN/LOCODE',
      content: (
        <span className='flex items-center gap-1.5'>
          <span className='font-mono text-sm'>{entry.code}</span>
          <CopyButton label='UN/LOCODE' value={entry.code} size='icon-xs' className='size-5' />
        </span>
      ),
    },
    {
      label: 'Country',
      content: (
        <span className='flex items-center gap-2'>
          <CountryFlag countryCode={entry.country} className='size-4' shape='circle' />
          <span>{country?.name ?? entry.country}</span>
          <span className='font-mono text-muted-foreground'>({entry.country})</span>
        </span>
      ),
    },
    {
      label: 'Location Code',
      content: <span className='font-mono text-sm'>{entry.location}</span>,
    },
    {
      label: 'Subdivision',
      content: <span className='font-mono text-sm'>{entry.subdivision}</span>,
    },
    {
      label: 'Status',
      content: (
        <Badge variant='outline' className='font-mono text-[10px]'>
          {entry.status}
        </Badge>
      ),
    },
    {
      label: 'Functions',
      content: (
        <span className='flex flex-wrap gap-1'>
          {entry.functions.length > 0 ? (
            entry.functions.map((fc) => {
              const fn = UNLOCODE_FUNCTIONS.find((f) => f.code === fc);
              return (
                <Badge key={fc} variant='outline' className='px-1.5 py-0 text-[10px] font-normal'>
                  {fn?.label ?? fc}
                </Badge>
              );
            })
          ) : (
            <span className='text-sm text-muted-foreground'>None</span>
          )}
        </span>
      ),
    },
    ...(entry.iata
      ? [
          {
            label: 'IATA Code',
            content: <span className='font-mono text-sm'>{entry.iata}</span>,
          },
        ]
      : []),
    {
      label: 'Coordinates',
      content: entry.coordinates ? (
        <span className='flex flex-wrap items-center gap-3'>
          <span className='font-mono text-sm text-muted-foreground'>
            {entry.coordinates.lat}, {entry.coordinates.lon}
          </span>
          <a
            href={mapsLink}
            target='_blank'
            rel='noreferrer noopener'
            className='inline-flex items-center gap-1 text-sm text-primary hover:underline underline-offset-4'
          >
            <MapPinIcon className='size-3.5' />
            Open in Google Maps
            <ExternalLinkIcon className='size-3' />
          </a>
        </span>
      ) : (
        <span className='text-sm text-muted-foreground'>Unavailable</span>
      ),
    },
  ];

  return (
    <dl className='divide-y divide-border'>
      {rows.map(({ label, content }) => (
        <div key={label} className='flex items-center gap-4 px-4 py-3'>
          <dt className='w-32 shrink-0 text-xs font-medium uppercase tracking-wider text-muted-foreground'>{label}</dt>
          <dd className='min-w-0 flex-1 text-sm text-foreground'>{content}</dd>
        </div>
      ))}
    </dl>
  );
}
