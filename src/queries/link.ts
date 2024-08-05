import {
  canTranslate,
  getContentTypes,
  getDefaultLanguage,
  getEntities,
} from "../utils/config";
import { parentQueryField } from "./hierarchy";

export function internalLinkQueryFields(language?: string): string {
  let queryFields = `
    _id,
    _type,
    title,
    slug,
    ${parentQueryField()},
  `;

  [...getContentTypes(), ...getEntities()]
    .filter((schema) => Boolean(schema.rewrite))
    .forEach((schema) => {
      if (canTranslate(Boolean(schema?.translate)) && language) {
        queryFields += `
        _type == "${schema.name}" => {
          "title": title.${language},
          "slug": slug.${language},
          ${parentQueryField(language)}
        },
      `;
      }
    });

  return queryFields;
}

export function linkQueryFields(language?: string): string {
  return `
    ...,
    internal->{ ${internalLinkQueryFields(language)} }
  `;
}
