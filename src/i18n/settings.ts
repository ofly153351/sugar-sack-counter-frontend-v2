export const i18nSettings = {
  locales: ["en", "th"],
  defaultLocale: "th",
} as const;

export type Locale = (typeof i18nSettings)["locales"][number];
