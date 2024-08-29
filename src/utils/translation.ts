import { TranslationPayload } from "../types/payload";
import { getDocumentHierarchyPath } from "./hierarchy";

function mapObjectByLanguage(obj: any, lang: string) {
  function recursiveMap(currentObj: any) {
    if (typeof currentObj !== "object" || currentObj === null) {
      return currentObj;
    }

    let mappedObj: any = Array.isArray(currentObj) ? [] : {};

    for (let key in currentObj) {
      if (currentObj.hasOwnProperty(key)) {
        const value = currentObj[key];

        if (typeof value === "object" && value !== null) {
          if (value.hasOwnProperty(lang)) {
            mappedObj[key] = value[lang];
          } else {
            mappedObj[key] = recursiveMap(value);
          }
        } else {
          mappedObj[key] = value;
        }
      }
    }

    return mappedObj;
  }

  return recursiveMap(obj);
}

export function getDocumentTranslationPathname(
  translations: TranslationPayload["_translation"],
  lang: string,
) {
  return getDocumentHierarchyPath(
    mapObjectByLanguage(translations, lang),
  )?.join("/");
}
