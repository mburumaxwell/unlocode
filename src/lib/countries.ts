import { getCountryDataList } from 'countries-list';

export type CountryInfo = {
  /** Country ISO alpha-2 code. */
  iso2: string;
  /** Country ISO alpha-3 code. */
  iso3: string;
  /** Country name in English. */
  name: string;
};

/** List of ISO-3166 countries. */
export const countries = getCountryDataList()
  .filter((d) => !d.userAssigned)
  .map((data): CountryInfo => {
    return {
      iso2: data.iso2,
      iso3: data.iso3,
      name: data.name,
    };
  });

/**
 * Get country information by ISO alpha-2 or alpha-3 code.
 * @param code - The ISO alpha-2 or alpha-3 country code.
 * @returns The country information, or undefined if not found.
 */
export function getCountry(code: string): CountryInfo | undefined {
  const upperCode = code.toUpperCase();
  return countries.find((country) => country.iso2 === upperCode || country.iso3 === upperCode);
}

/** Names for codes UN/LOCODE uses that are not ISO-3166 countries. */
const EXTRA_COUNTRY_NAMES: Record<string, string> = {
  XZ: 'International Waters', // UN/LOCODE: "Installations in International Waters"
};

/**
 * Get the English name for a country code, falling back to the code itself when unknown.
 * @param code - The ISO alpha-2 or alpha-3 country code.
 */
export function getCountryName(code: string): string {
  const upperCode = code.toUpperCase();
  return getCountry(upperCode)?.name ?? EXTRA_COUNTRY_NAMES[upperCode] ?? upperCode;
}
