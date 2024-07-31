import { loadQuery } from "../loadQuery";
import { getContentTypeByName } from "../../utils/config";
import {
  appendFieldToGROQStatement,
  composeParentFieldQuery,
  composeSupportsQuery,
  isValidProjection,
} from "../../utils/groq";

type LoadContentTypeParams = {
  /**
   * Unique name of content type.
   */
  name: string;
  /**
   * Accepts slug segments as an array.
   */
  slug: string[];
  /**
   * Custom projection for the query. Must starts with `{` and ends with `}`.
   */
  projection?: string;
};

/**
 * Loads a single content type document by name and slug.
 *
 * @param name - The name of the content type.
 * @param slug - The slug of the content type.
 * @param projection - The projection for the content type.
 * @returns A promise that resolves to the loaded content type.
 */
export async function loadContentType<PayloadType>({
  name,
  slug,
  projection,
}: LoadContentTypeParams) {
  const contentTypeObject = getContentTypeByName(name);

  if (!contentTypeObject) {
    throw new Error(`Content type "${name}" not found.`);
  }

  // Construct the dynamic GROQ query
  if (projection) {
    if (!isValidProjection(projection)) {
      throw new Error("Projection must start and close with a curly brace.");
    }
  }

  const _slug = slug.reverse();

  // Construct the dynamic GROQ query that retrieves the page by its slug and its parent slug.
  let query = `*[_type == $type && slug.current == "${_slug[0]}"`;

  for (let i = 1; i < _slug.length; i++) {
    let parentPath = "parent" + "->parent".repeat(i - 1);
    query += ` && ${parentPath}->slug.current == "${_slug[i]}"`;
  }

  query += `][0]`;

  let queryProjection = composeSupportsQuery(contentTypeObject, projection);

  // Additional field for hierarchical content type.
  if (Boolean(contentTypeObject.hierarchical)) {
    queryProjection = appendFieldToGROQStatement(
      queryProjection,
      composeParentFieldQuery(),
    );
  }

  query += queryProjection;

  return await loadQuery<PayloadType | null>(
    query,
    { type: name },
    { next: { tags: [`${name}:${_slug[0]}`] } },
  );
}
