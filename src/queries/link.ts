import { getConfig } from "../config/kitConfig";
import { canTranslate, getContentTypes, getEntities } from "../utils/config";
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

  const internalLinkQueryFieldsResolver =
    getConfig()?.resolve?.internalLinkQueryFields;

  if (
    internalLinkQueryFieldsResolver &&
    typeof internalLinkQueryFieldsResolver === "function"
  ) {
    queryFields = internalLinkQueryFieldsResolver(queryFields, language);
  }

  return queryFields;
}

export function linkQueryFields(language?: string): string {
  return `
    ...,
    internal->{ ${internalLinkQueryFields(language)} }
  `;
}
