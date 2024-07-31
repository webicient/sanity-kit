import { groq } from "next-sanity";
import { CORE_FIELDS } from "../config/defaults/fields";
import { ContentType, Entity, Taxonomy } from "../types/definition";
import { getModules, isSupports } from "./config";

type GroqQuery = string;

/**
 * Maximum depth of nested documents to retrieve.
 */
export const MAX_DEPTH = 10;

/**
 * Validates a GROQ projection string.
 *
 * @param projection - The GROQ projection string to validate.
 * @throws {Error} If the projection string is invalid.
 */
export function isValidProjection(projection: string): boolean {
  let trimmedStr = projection.replace(/\s+/g, "");
  return trimmedStr.startsWith("{") && trimmedStr.endsWith("}");
}

/**
 * Appends new fields to an existing GROQ query statement.
 *
 * @param existingQuery - The existing GROQ query.
 * @param newFields - The new fields to append to the query.
 * @returns The modified GROQ query with the new fields appended.
 * @throws {Error} If the existing query is not in the expected format.
 */
export function appendFieldtoProjection(
  existingQuery: GroqQuery,
  newFields: GroqQuery,
): GroqQuery {
  // Find the index of the last closing brace '}'.
  const lastBraceIndex = existingQuery.lastIndexOf("}");

  // If the last brace index is found, insert the new fields before it
  if (lastBraceIndex !== -1) {
    // Construct the new query by appending new fields before the last closing brace
    const newQuery = `${existingQuery.substring(0, lastBraceIndex).trim()}, ${newFields.trim()} \n}`;
    return newQuery;
  } else {
    // If the existing query is not in the expected format, return it unmodified
    throw new Error("Invalid GROQ query format");
  }
}

/**
 * Composes the parent query field for retrieving hierarchical data.
 *
 * @param depth The depth of the hierarchy to retrieve. Defaults to MAX_DEPTH.
 * @returns The composed parent query field.
 */
export function parentProjection(depth: number = MAX_DEPTH): string {
  let queryField = `"parent": parent->{ _type, _id, title, slug`;
  for (let i = 1; i < depth; i++) {
    queryField += `, "parent": parent->{ _type, _id, title, slug`;
  }
  // Close all opened braces.
  queryField += "}".repeat(depth);
  return queryField;
}

/**
 * Composes a query string by joining the queries of all modules.
 *
 * @returns The composed query string.
 */
export function modulesFieldProjection(): string {
  const modulesQueries = getModules()
    .map((module) => {
      if (module.query && !isValidProjection(module.query)) {
        throw new Error(
          `Invalid GROQ query format for module "${module.name}".`,
        );
      }

      return module.query
        ? `_type == "${module.name}" => ${module.query}`
        : null;
    })
    .filter(Boolean);

  return ["...", ...modulesQueries].join(",");
}

/**
 * Prepares a GROQ query projection for a given schema object.
 *
 * @param schemaObject - The schema object (ContentType, Entity, or Taxonomy) to prepare the query for.
 * @param projection - The custom projection string to include in the query. If not provided, default fields will be included.
 * @returns The GROQ query projection string.
 */
export function supportsFieldsProjection(
  schemaObject: ContentType | Entity | Taxonomy,
  projection?: string,
): string {
  if (!projection) {
    return "...";
  }

  let queryProjection = projection;

  // Always add `_type` field.
  queryProjection = appendFieldtoProjection(
    queryProjection,
    `"_type": _type`,
  );

  for (const type of Object.keys(CORE_FIELDS)) {
    if (type === "modules" && isSupports(schemaObject, type)) {
      queryProjection = appendFieldtoProjection(
        queryProjection,
        `modules[] {
          ${modulesFieldProjection()}
        }`,
      );
    } else if (isSupports(schemaObject, type)) {
      queryProjection = appendFieldtoProjection(
        queryProjection,
        `"${type}": ${type}`,
      );
    }
  }

  return queryProjection;
}

/**
 * Returns the projection for an internal link.
 * Includes the _id, _type, title, slug, and parent projection.
 *
 * @returns The projection string.
 */
export function internalLinkProjection(): string {
  return `
    _id,
    _type,
    title,
    slug,
    ${parentProjection()}
  `;
}

/**
 * Returns the link projection for a Sanity query.
 * This includes the internal link projection.
 *
 * @returns The link projection as a string.
 */
export function linkProjection(): string {
  return `
    ...,
    internal->{ ${internalLinkProjection()} }
  `;
}
