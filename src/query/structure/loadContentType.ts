import { loadQuery } from "../loadQuery";
import { getContentTypeByName } from "../../utils/config";
import {
  appendFieldToGROQStatement,
  composeParentFieldQuery,
} from "../../utils/groq";
import { isSupports } from "./utils";

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
  const contentTypeObject = getContentTypeByName(name);

  if (!contentTypeObject) {
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
  if (Boolean(contentTypeObject.hierarchical)) {
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
    if (isSupports(contentTypeObject, type)) {
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
