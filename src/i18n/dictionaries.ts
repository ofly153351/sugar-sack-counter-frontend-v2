import en from "./en/common.json";
import th from "./th/common.json";
import { Locale } from "./settings";

export type Dictionary = typeof en;

const dictionaries: Record<Locale, Dictionary> = { en, th };

export const getDictionary = async (locale: Locale): Promise<Dictionary> => {
  const dict = dictionaries[locale];
  if (!dict) throw new Error(`No dictionary found for locale: ${locale}`);
  return dict;
};
