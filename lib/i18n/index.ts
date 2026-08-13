import { en } from "./en";
import { pl } from "./pl";

export type Locale = "pl" | "en";
export const defaultLocale: Locale = "pl";

export function getDictionary(locale: Locale = defaultLocale) {
  return locale === "en" ? en : pl;
}
