import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { defaultLocale, localePrefix, locales } from "./config";

export async function middleware(request: NextRequest): Promise<any> {
  const { pathname } = request.nextUrl;

  const handleI18nRouting = createMiddleware({
    locales,
    localePrefix,
    defaultLocale,
    localeDetection: false,
  });

  const detectedLocale = locales.find((locale) => pathname.startsWith(`/${locale}`)) || defaultLocale;

  const response = handleI18nRouting(request);
  // Always set the locale to the detected locale.
  response.cookies.set("NEXT_LOCALE", detectedLocale);

  return response;
}

export const config = {
  matcher: ["/((?!api|studio|_next|_vercel|.*\\..*).*)"],
};
