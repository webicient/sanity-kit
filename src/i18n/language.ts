let LANGUAGE_STORE: null | string = null;

export function setCurrentLanguage(language: string): string {
  LANGUAGE_STORE = language;
  return LANGUAGE_STORE;
}

export function getCurrentLanguage(): null | string {
  if (typeof document === "undefined") {
    return LANGUAGE_STORE;
  }

  return document?.documentElement?.lang || LANGUAGE_STORE;
}
