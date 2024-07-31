import { loadQuery } from "../loadQuery";
import { getEntityByName } from "../../utils/config";
import { supportsFieldsProjection, isValidProjection } from "../../utils/groq";

type LoadEntityParams = {
  /**
   * Unique name of entity.
   */
  name: string;
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
export async function loadEntity<PayloadType>({
  name,
  projection,
}: LoadEntityParams) {
  const entity = getEntityByName(name);

  if (!entity) {
    throw new Error(`Entity "${name}" not found.`);
  }

  // Construct the dynamic GROQ query
  if (projection) {
    if (!isValidProjection(projection)) {
      throw new Error("Projection must start and close with a curly brace.");
    }
  }

  let query = `*[_id == $type][0]`;
  let queryProjection = projection
    ? `${projection}`
    : `{
      _id,
      _type
    }`;

  queryProjection = supportsFieldsProjection(entity, queryProjection);
  query += queryProjection;

  return await loadQuery<PayloadType | null>(
    query,
    { type: name },
    { next: { tags: [`${name}`] } },
  );
}
