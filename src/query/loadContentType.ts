import { loadQuery } from "./loadQuery";
import { getContentTypeByName } from "../utils/config";
import {
  appendFieldToGROQStatement,
  composeParentFieldQuery,
} from "../utils/groq";
import { ContentType } from "../types";

type LoadContentTypeParams = {
  /**
   * Unique name of content type.
   */
  name: string;
  /**
   * Accepts slug segments as an array.
   */
  slugs: string[];
  /**
   * Custom projection for the query. Must starts with `{` and ends with `}`.
   */
  projection?: string;
};

/**
 * Checks if the given content type supports the specified type.
 *
 * @param contentType - The content type to check.
 * @param type - The type to check for support.
 * @returns A boolean indicating whether the content type supports the specified type.
 */
function isSupports(contentType: ContentType, type: string) {
  return contentType.supports?.findIndex((t) => t === type) !== -1;
}

/**
 * Loads a single content type document by name and slugs.
 *
 * @param name - The name of the content type.
 * @param slugs - The slugs of the content type.
 * @param projection - The projection for the content type.
 * @returns A promise that resolves to the loaded content type.
 */
export async function loadContentType<PayloadType>({
  name,
  slugs,
  projection,
}: LoadContentTypeParams) {
  const contentType = getContentTypeByName(name);

  if (!contentType) {
    throw new Error(`Content type "${name}" not found.`);
  }

  // Construct the dynamic GROQ query
  if (projection) {
    // Detect if usage of projection is correct.
    if (!projection.startsWith("{") || !projection.endsWith("}")) {
      throw new Error("Projection must start and close with a curly brace.");
    }
  }

  const _slugs = slugs.reverse();

  // Construct the dynamic GROQ query that retrieves the page by its slug and its parent slugs.
  let query = `*[_type == $type && slug.current == "${_slugs[0]}"`;

  for (let i = 1; i < _slugs.length; i++) {
    let parentPath = "parent" + "->parent".repeat(i - 1);
    query += ` && ${parentPath}->slug.current == "${_slugs[i]}"`;
  }

  query += `][0]`;

  let queryProjection = projection
    ? `${projection}`
    : `{
      _id,
      _type,
      slug
    }`;

  // Additional field for hierarchical content type.
  if (Boolean(contentType.hierarchical)) {
    queryProjection = appendFieldToGROQStatement(
      queryProjection,
      composeParentFieldQuery(),
    );
  }

  for (const type of [
    "seo",
    "slug",
    "title",
    "featuredImage",
    "excerpt",
    "body",
  ]) {
    if (isSupports(contentType, type)) {
      queryProjection = appendFieldToGROQStatement(
        queryProjection,
        `"${type}": ${type}`,
      );
    }
  }

  query += queryProjection;

  return await loadQuery<PayloadType | null>(
    query,
    { type: name },
    { next: { tags: [`${name}:${_slugs[0]}`] } },
  );
}
