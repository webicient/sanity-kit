import { loadQuery } from "../loadQuery";
import { getTaxonomyQuery } from "../../queries/taxonomy";
import { ResponseQueryOptions } from "next-sanity";

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
   * Custom language for the query.
   */
  language?: string;
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
export async function loadTaxonomy<PayloadType>(
  { name, slug, language, projection }: LoadTaxonomyParams,
  options?:
    | Pick<
        ResponseQueryOptions,
        "perspective" | "cache" | "next" | "useCdn" | "stega"
      >
    | undefined,
) {
  return await loadQuery<PayloadType | null>(
    getTaxonomyQuery(name, slug, language, projection),
    { type: name },
    {
      ...options,
      next: {
        ...options?.next,
        tags: [...(options?.next?.tags || []), `${name}:${slug.reverse()[0]}`],
      },
    },
  );
}
