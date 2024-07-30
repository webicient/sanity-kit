import { loadQuery } from "../loadQuery";
import { getEntityByName } from "../../utils/config";
import { appendFieldToGROQStatement } from "../../utils/groq";
import { isSupports } from "./utils";
import { CORE_FIELDS } from "../../config/defaults/fields";

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
    // Detect if usage of projection is correct.
    if (!projection.startsWith("{") || !projection.endsWith("}")) {
      throw new Error("Projection must start and close with a curly brace.");
    }
  }

  let query = `*[_id == "home"][0]`;

  let queryProjection = projection
    ? `${projection}`
    : `{
      _id,
      _type
    }`;

  // Always add `type` field.
  queryProjection = appendFieldToGROQStatement(
    queryProjection,
    `"_type": _type`,
  );

  for (const type of Object.keys(CORE_FIELDS)) {
    if (isSupports(entity, type)) {
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
    { next: { tags: [`${name}`] } },
  );
}
