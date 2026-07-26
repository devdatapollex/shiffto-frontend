import CountryList from 'country-list-with-dial-code-and-flag';

export interface Country {
  code: string;
  name: string;
  flag: string;
  callingCode: string;
}

const seenCodes = new Set<string>();

export const COUNTRIES: Country[] = CountryList.getAll()
  .filter((country) => {
    if (seenCodes.has(country.code)) return false;
    seenCodes.add(country.code);
    return true;
  })
  .map((country) => ({
    code: country.code,
    name: country.name,
    flag: country.flag,
    callingCode: country.dial_code,
  }));

export function getCountryByCode(code: string): Country | undefined {
  const country = CountryList.findOneByCountryCode(code);
  if (!country) return undefined;
  return {
    code: country.code,
    name: country.name,
    flag: country.flag,
    callingCode: country.dial_code,
  };
}
