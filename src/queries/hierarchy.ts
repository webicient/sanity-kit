import { getConfig } from "../config/kitConfig";
import {
  canTranslate,
  getContentTypes,
  getDefaultLanguage,
  getEntities,
} from "../utils/config";

const MAX_DEPTH = 4;

export function parentQueryField(language?: string): string {
  let queryField = `"parent": parent->{ _type, _id, title, slug`;

  for (let i = 1; i < MAX_DEPTH; i++) {
    queryField += `, "parent": parent->{ _type, _id, title, slug`;
  }

  queryField += "}".repeat(MAX_DEPTH);

  if (language) {
    queryField = queryField.replaceAll("slug", `"slug": slug.${language}`);
    queryField = queryField.replaceAll("title", `"title": title.${language}`);
  }

  return queryField;
}

export function hierarchyQueryFields(
  language?: string,
  schemaName?: string,
): string {
  let queryFields = `
    _id,
    _type,
    title,
    slug,
    ${parentQueryField()},
  `;

  if (language) {
    if (schemaName) {
      const schemaObject = [...getContentTypes(), ...getEntities()].find(
        (schema) => schema.name === schemaName && Boolean(schema.rewrite),
      );

      if (
        schemaObject &&
        canTranslate(Boolean(schemaObject?.translate)) &&
        language
      ) {
        queryFields += `
          _type == "${schemaObject.name}" => {
            "title": title.${language},
            "slug": slug.${language},
            ${parentQueryField(language)}
          },
        `;
      }
    } else {
      // Dynamic all schemas but makes the query string longer.
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
    }
  }

  // Always apply hierarchyQueryFields resolver if it's defined.
  const hierarchyQueryFieldsResolver = getConfig()?.resolve?.hierarchyQueryFields;
  if (hierarchyQueryFieldsResolver && typeof hierarchyQueryFieldsResolver === "function") {
    queryFields = hierarchyQueryFieldsResolver(queryFields, language, schemaName);
  }

  return queryFields;
}
