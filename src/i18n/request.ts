import { getRequestConfig } from "next-intl/server";
import { i18nSettings, Locale } from "./settings";

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that a valid locale is used
  if (!locale || !i18nSettings.locales.includes(locale as Locale)) {
    locale = i18nSettings.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`./${locale}/common.json`)).default,
  };
});
