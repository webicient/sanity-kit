import type { Pathnames, LocalePrefix } from "next-intl/routing";

export const defaultLocale = "sv" as const;

export const locales = ["en", "sv"] as const;

export const pathnames: Pathnames<typeof locales> = {
  "/": "/",
};

export const localePrefix: LocalePrefix<typeof locales> = "always";
