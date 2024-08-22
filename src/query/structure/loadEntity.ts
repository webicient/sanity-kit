import { loadQuery } from "../loadQuery";
import { getEntityByName } from "../../utils/config";
import { Language } from "@sanity/language-filter";
import { getEntityQuery } from "../../queries/entity";
import { ResponseQueryOptions } from "next-sanity";

type LoadEntityParams = {
  /**
   * Unique name of entity.
   */
  name: string;
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
 * Loads a single entity document by name and slug.
 *
 * @param name - The name of the entity.
 * @param projection - The projection for the entity.
 * @returns A promise that resolves to the loaded entity.
 */
export async function loadEntity<PayloadType>(
  { name, language, projection }: LoadEntityParams,
  options?:
    | Pick<
        ResponseQueryOptions,
        "perspective" | "cache" | "next" | "useCdn" | "stega"
      >
    | undefined,
) {
  return await loadQuery<PayloadType | null>(
    getEntityQuery(name, language, projection),
    { type: name },
    {
      ...options,
      next: {
        ...options?.next,
        tags: [...(options?.next?.tags || []), `${name}`],
      },
    },
  );
}
