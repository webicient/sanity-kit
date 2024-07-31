import { loadQuery } from "../loadQuery";
import { getTaxonomyByName } from "../../utils/config";
import { supportsFieldsProjection, isValidProjection } from "../../utils/groq";

type LoadTaxonomyParams = {
  /**
   * Unique name of taxonomy.
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
 * Loads a single taxonomy document by name and slug.
 *
 * @param name - The name of the taxonomy.
 * @param slug - The slug of the taxonomy.
 * @param projection - The projection for the taxonomy.
 * @returns A promise that resolves to the loaded taxonomy.
 */
export async function loadTaxonomy<PayloadType>({
  name,
  slug,
  projection,
}: LoadTaxonomyParams) {
  const taxonomy = getTaxonomyByName(name);

  if (!taxonomy) {
    throw new Error(`Taxonomy "${name}" not found.`);
  }

  // Construct the dynamic GROQ query
  if (projection) {
    if (!isValidProjection(projection)) {
      throw new Error("Projection must start and close with a curly brace.");
    }
  }

  const _slug = slug.reverse();

  // Construct the dynamic GROQ query that retrieves the page by its slug and its parent slug.
  let query = `*[_type == $type && slug.current == "${_slug[0]}"][0]`;
  let queryProjection = projection
    ? `${projection}`
    : `{
      _id,
      _type
    }`;

  queryProjection = supportsFieldsProjection(taxonomy, queryProjection);
  query += queryProjection;

  return await loadQuery<PayloadType | null>(
    query,
    { type: name },
    { next: { tags: [`${name}:${_slug[0]}`] } },
  );
}
