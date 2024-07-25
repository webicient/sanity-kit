import { loadQuery } from "./loadQuery";
import { getTaxonomyByName } from "../utils/config";
import { appendFieldToGROQStatement } from "../utils/groq";
import { Taxonomy } from "../types";

type LoadTaxonomyParams = {
  /**
   * Unique name of taxonomy.
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
 * Checks if the given taxonomy supports the specified type.
 *
 * @param taxonomy - The taxonomy to check.
 * @param type - The type to check for support.
 * @returns A boolean indicating whether the taxonomy supports the specified type.
 */
function isSupports(taxonomy: Taxonomy, type: string) {
  return taxonomy.supports?.findIndex((t) => t === type) !== -1;
}

/**
 * Loads a single taxonomy document by name and slugs.
 *
 * @param name - The name of the taxonomy.
 * @param slugs - The slugs of the taxonomy.
 * @param projection - The projection for the taxonomy.
 * @returns A promise that resolves to the loaded taxonomy.
 */
export async function loadTaxonomy<PayloadType>({
  name,
  slugs,
  projection,
}: LoadTaxonomyParams) {
  const taxonomy = getTaxonomyByName(name);

  if (!taxonomy) {
    throw new Error(`Taxonomy "${name}" not found.`);
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
  let query = `*[_type == $type && slug.current == "${_slugs[0]}"][0]`;

  let queryProjection = projection
    ? `${projection}`
    : `{
      _id,
      _type,
      slug
    }`;

  for (const type of [
    "seo",
    "slug",
    "title",
    "featuredImage",
    "excerpt",
    "body",
  ]) {
    if (isSupports(taxonomy, type)) {
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
