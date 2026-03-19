'use client';

import { type VariantProps, cva } from 'class-variance-authority';
import { GlobeIcon } from 'lucide-react';

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
import { type CountryInfo, countries as allCountries } from '@/lib/countries';
import { cn } from '@/lib/utils';

// partly inspired by https://shadcn-country-dropdown.vercel.app

const countryComboboxVariants = cva(
  [
    'border-input bg-background ring-offset-background data-placeholder:text-muted-foreground',
    'focus:ring-ring flex items-center justify-between overflow-hidden whitespace-nowrap',
    'rounded-md border text-sm shadow-xs focus:outline-hidden focus:ring-1',
    'disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
    'dark:bg-input/30 gap-2',
  ],
  {
    variants: {
      variant: {
        default: '',
        code: '',
        flag: '',
      },
      size: {
        default: 'h-9 px-3 py-1',
        sm: 'h-8 px-2.5 py-0.5 text-xs',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface CountryComboboxProps
  extends
    Omit<
      React.ComponentProps<typeof Combobox<CountryOption>>,
      'items' | 'itemToStringValue' | 'value' | 'onValueChange'
    >,
    Pick<React.ComponentProps<typeof ComboboxTrigger>, 'className'>,
    Pick<React.ComponentProps<typeof ComboboxValue>, 'placeholder'>,
    VariantProps<typeof countryComboboxVariants> {
  /** The selected country code. */
  value?: string | null;

  /** Callback when country changes. */
  onValueChange?: (value: string | null) => void;

  /** List of country codes to show, defaults to all known countries. */
  countries?: string[];

  /** List of country codes to disable in the select, defaults to empty/none. */
  disabledCountries?: string[];

  /**
   * Visual style of the flag.
   * @default 'circle'
   */
  flagShape?: 'rect' | 'circle' | 'emoji';
}

/** A combobox component for choosing a country. It shows the country code and name. */
export function CountryCombobox({
  value,
  onValueChange,
  countries,
  disabledCountries = [],
  placeholder = 'Select country',
  variant = 'default',
  size = 'default',
  flagShape,
  className,
  ...props
}: CountryComboboxProps) {
  const anchor = useComboboxAnchor();
  const options = getOptions({ countries, disabledCountries });
  const selectedCountry = (value && options.find((c) => c.iso3 === value || c.iso2 === value)) || null;

  return (
    <Combobox<CountryOption>
      items={options}
      itemToStringValue={(country) => country.iso3}
      value={selectedCountry}
      onValueChange={(country) => onValueChange?.(country?.iso3 ?? null)}
      {...props}
    >
      <ComboboxTrigger className={cn(countryComboboxVariants({ variant, size }), className)}>
        <ComboboxValue placeholder={placeholder}>
          {variant === 'code' ? (
            value && <span>{value}</span>
          ) : variant === 'flag' ? (
            selectedCountry ? (
              <CountryFlagWithShape countryCode={selectedCountry.iso2} shape={flagShape} className='size-4' />
            ) : (
              <GlobeIcon className='size-4' />
            )
          ) : selectedCountry ? (
            <div className='flex min-w-0 items-center gap-2'>
              <CountryFlagWithShape countryCode={selectedCountry.iso2} shape={flagShape} className='size-4' />
              <span className='truncate'>{selectedCountry.name}</span>
            </div>
          ) : (
            value
          )}
        </ComboboxValue>
      </ComboboxTrigger>
      <ComboboxContent anchor={anchor} className='w-full'>
        <ComboboxInput placeholder='Search countries...' showTrigger={false} />
        <ComboboxEmpty>No country found.</ComboboxEmpty>
        <ComboboxList>
          {(opt: CountryOption) => (
            <ComboboxItem key={opt.iso3} value={opt} disabled={opt.disabled}>
              <div className='flex items-center gap-2'>
                <CountryFlagWithShape countryCode={opt.iso2} shape={flagShape} className='size-4' />
                <span className='overflow-hidden text-ellipsis whitespace-nowrap'>{opt.name}</span>
              </div>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

type CountryOption = CountryInfo & { disabled?: boolean };
function getOptions({
  countries,
  disabledCountries,
}: Pick<CountryComboboxProps, 'countries' | 'disabledCountries'>): CountryOption[] {
  const options = countries?.length
    ? allCountries.filter((c) => countries.includes(c.iso3) || countries.includes(c.iso2))
    : allCountries;
  return options.map((c) => ({
    ...c,
    disabled: disabledCountries?.includes(c.iso3) || disabledCountries?.includes(c.iso2),
  }));
}

export interface CountryFlagProps extends Omit<React.ComponentPropsWithoutRef<'img'>, 'src' | 'alt'> {
  /**
   * ISO 3166-1 alpha-2 country code.
   */
  countryCode: string;

  /**
   * Visual style.
   * @default 'rect'
   */
  shape?: 'rect' | 'circle';
}

/** Renders a country flag as an image. */
export function CountryFlag({ countryCode, shape = 'rect', className, ...props }: CountryFlagProps) {
  const code = countryCode.toUpperCase();
  const title = `Flag of ${code}`;

  const ratioPath = shape === 'circle' ? '1x1' : '4x3';
  const src = `https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/${ratioPath}/${code.toLowerCase()}.svg`;

  return (
    // oxlint-disable-next-line nextjs/no-img-element -- next/image improvement is negligible here and adds complexity
    <img
      src={src}
      alt={title}
      aria-label={title}
      title={title}
      loading='lazy'
      decoding='async'
      className={cn(
        'inline-block shrink-0 object-cover not-dark:border',
        shape === 'circle' ? 'aspect-square rounded-full' : 'aspect-4/3',
        className,
        // for rect, we need to force auto width assuming a height has been set, to prevent distortion
        // for example, mostly we set size-4 which sets w-4 and h-4, setting w-auto allows the width to
        // adjust to maintain the aspect ratio of the flag
        shape === 'rect' && 'w-auto',
      )}
      {...props}
    />
  );
}

export interface CountryFlagEmojiProps
  extends Pick<CountryFlagProps, 'countryCode'>, Omit<React.ComponentProps<'span'>, 'children'> {}

/** Renders a country flag as an emoji using Unicode regional indicator symbols. */
export function CountryFlagEmoji({ countryCode, ...props }: CountryFlagEmojiProps) {
  // offset between uppercase ascii and regional indicator symbols
  const OFFSET = 127397;

  const code = countryCode.toUpperCase();
  const emoji = code.replace(/./g, (char) => String.fromCodePoint(char.charCodeAt(0) + OFFSET));
  const title = `Flag of ${code}`;

  return (
    <span role='img' aria-label={title} title={title} {...props}>
      {emoji}
    </span>
  );
}

type CountryFlagWithShapeProps = Omit<CountryFlagProps | CountryFlagEmojiProps, 'shape'> & {
  shape: CountryComboboxProps['flagShape'];
};
function CountryFlagWithShape({ shape = 'circle', ...props }: CountryFlagWithShapeProps) {
  if (shape === 'emoji') return <CountryFlagEmoji {...props} />;
  return <CountryFlag shape={shape} {...props} />;
}
