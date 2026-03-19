'use client';

import * as React from 'react';

import { CountryCombobox, CountryFlag } from '@/components/country';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
  useComboboxAnchor,
} from '@/components/ui/combobox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { useDebounce } from '@/hooks/use-debounce';
import { useUnlocodeSearch } from '@/hooks/use-unlocode-search';
import { getCountry } from '@/lib/countries';
import { UNLOCODE_FUNCTIONS, type UnlocodeEntry, type UnlocodeFunctionCode } from '@/lib/unlocode';
import { cn } from '@/lib/utils';

export interface UnlocodeInputProps {
  id?: string;
  value?: string | null;
  onValueChange?: (value: string | null, entry?: UnlocodeEntry) => void;
  placeholder?: string;

  /**
   * Optional filter to only show locations with certain functions (e.g. only ports and airports).
   * This is passed to the search API and also used to filter the selected value for display.
   * Note that this does not restrict the selectable values in the combobox,
   * but rather filters the search results.
   */
  functions?: UnlocodeFunctionCode[];

  /**
   * Optional country restriction for the country selector and search results.
   * Uses ISO alpha-2 codes (e.g. ['US', 'CA']).
   */
  countries?: string[];
  className?: string;
}

export function UnlocodeInput({
  id,
  value,
  onValueChange,
  placeholder = 'Search UN/LOCODE...',
  functions,
  countries,
  className,
}: UnlocodeInputProps) {
  const anchor = useComboboxAnchor();
  const [open, setOpen] = React.useState(false);
  const [country, setCountry] = React.useState<string | null>(
    (value && getCountry(value.slice(0, 2).toUpperCase())?.iso2) || null,
  );
  const [query, setQuery] = React.useState('');
  const debouncedQuery = useDebounce(query, 300);

  const { results, isLoading, isValidating } = useUnlocodeSearch({
    query: debouncedQuery,
    countries: country ? [country] : countries,
    functions,
    enabled: open,
    limit: 20,
  });

  // Find the selected entry for display
  const selectedEntry = (value && (results.find((r) => r.code === value) ?? null)) || null;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <ButtonGroup aria-label='UN/LOCODE compact selector' className='w-full'>
        {/* Country filter button */}
        <CountryCombobox
          value={country}
          countries={countries}
          onValueChange={(value) => setCountry((value && getCountry(value)?.iso2) || null)}
          variant='flag'
        />

        {/* Location search combobox */}
        <Combobox<UnlocodeEntry>
          items={results}
          itemToStringValue={(entry) => entry.code}
          value={selectedEntry}
          open={open}
          onOpenChange={(nextOpen) => {
            setOpen(nextOpen);
            if (!nextOpen) setQuery('');
          }}
          onValueChange={(entry) => {
            if (!entry) return;
            if (entry.code === value) {
              onValueChange?.(null, undefined);
            } else {
              onValueChange?.(entry.code, entry);
            }
            setOpen(false);
            setQuery('');
          }}
        >
          <ComboboxTrigger id={id} render={<Button variant='outline' />} className='min-w-0 flex-1 justify-between'>
            <ComboboxValue placeholder={placeholder}>
              {value ? (
                <span className=''>{selectedEntry?.code ?? value}</span>
              ) : (
                <span className='text-muted-foreground'>{placeholder}</span>
              )}
            </ComboboxValue>
          </ComboboxTrigger>
          <ComboboxContent anchor={anchor} className='w-full p-0'>
            <ComboboxInput
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='Type to search locations...'
              showTrigger={false}
              showClear
            />
            <ComboboxEmpty>
              {isLoading || isValidating ? (
                <span className='inline-flex items-center gap-2'>
                  <Spinner className='size-3' />
                  Searching...
                </span>
              ) : query ? (
                'No locations found'
              ) : (
                'Type to search locations...'
              )}
            </ComboboxEmpty>
            <ComboboxList>
              {(entry: UnlocodeEntry) => (
                <ComboboxItem key={entry.code} value={entry}>
                  <CountryFlag countryCode={entry.country} className='size-4' shape='circle' />
                  <span className='font-mono font-semibold'>{entry.code}</span>
                  <span className='truncate'>{entry.name}</span>
                  <div className='ml-auto flex gap-0.5'>
                    {entry.functions.slice(0, 3).map((fc) => {
                      const fn = UNLOCODE_FUNCTIONS.find((f) => f.code === fc);
                      return (
                        <Badge key={fc} variant='outline' className='px-1 py-0 text-[9px]'>
                          {fn?.label?.slice(0, 4) ?? fc}
                        </Badge>
                      );
                    })}
                  </div>
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </ButtonGroup>
    </div>
  );
}

export interface UnlocodeFunctionFilterProps {
  value: UnlocodeFunctionCode[];
  onValueChange: (value: UnlocodeFunctionCode[]) => void;
  className?: string;
}

export function UnlocodeFunctionFilter({ value, onValueChange, className }: UnlocodeFunctionFilterProps) {
  return (
    <Select multiple value={value} onValueChange={(codes) => onValueChange(codes ?? [])}>
      <SelectTrigger className={className}>
        <SelectValue>
          {(codes: UnlocodeFunctionCode[]) => {
            if (!codes || codes.length === 0)
              return <span className='text-muted-foreground'>Filter by function...</span>;
            if (codes.length === 1) return UNLOCODE_FUNCTIONS.find((fn) => fn.code === codes[0])?.label;
            return `${codes.length} functions`;
          }}
        </SelectValue>
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false} className='w-fit'>
        {UNLOCODE_FUNCTIONS.map((fn) => (
          <SelectItem key={fn.code} value={fn.code}>
            <span className='flex flex-col'>
              <span>{fn.label}</span>
              <span className='text-xs text-muted-foreground'>{fn.description}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
