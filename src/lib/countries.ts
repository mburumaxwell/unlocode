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
