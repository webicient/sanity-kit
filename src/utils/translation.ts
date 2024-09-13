import { TranslationPayload } from "../types/payload";
import { getContentTypeByName } from "./config";
import { getDocumentHierarchyPath } from "./hierarchy";
import { resolveHref } from "./url";

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
  translation: TranslationPayload["_translation"] | undefined,
  lang: string,
) {
  if (
    !translation?._type ||
    !getContentTypeByName(translation?._type)?.rewrite
  ) {
    return "";
  }

  return resolveHref(translation._type, {
    slug: (
      getDocumentHierarchyPath(mapObjectByLanguage(translation, lang)) || []
    )?.join("/"),
  });
}
