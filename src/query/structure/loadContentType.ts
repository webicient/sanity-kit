import { loadQuery } from "../loadQuery";
import { getContentTypeQuery } from "../../queries/contentType";
import { Language } from "@sanity/language-filter";
import { ResponseQueryOptions } from "next-sanity";

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
   * The language of the content type.
   */
  language?: Language["id"];
  /**
   * Custom projection for the query. Must starts with `{` and ends with `}`.
   */
  projection?: string;
};

/**
 * Loads the content type with the specified parameters.
 *
 * @param name - The name of the content type.
 * @param slug - The slug of the content type.
 * @param language - The language of the content type.
 * @param projection - The projection of the content type.
 * @returns A promise that resolves to the loaded content type payload or null.
 */
export async function loadContentType<PayloadType>(
  { name, slug, language, projection }: LoadContentTypeParams,
  options?:
    | Pick<
        ResponseQueryOptions,
        "perspective" | "cache" | "next" | "useCdn" | "stega"
      >
    | undefined,
) {
  return await loadQuery<PayloadType | null>(
    getContentTypeQuery(name, slug, language, projection),
    {},
    {
      ...options,
      next: {
        ...options?.next,
        tags: [
          ...(options?.next?.tags || []),
          ...slug.map((slugName) => `${name}:${slugName}`),
        ],
      },
    },
  );
}
