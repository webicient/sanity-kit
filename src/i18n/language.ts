let LANGUAGE_STORE: null | string = null;

export function setCurrentLanguage(language: string): string {
  LANGUAGE_STORE = language;
  return LANGUAGE_STORE;
}

export function getCurrentLanguage(): null | string {
  return LANGUAGE_STORE;
}
