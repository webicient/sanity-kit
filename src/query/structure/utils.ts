import { ContentType, Entity, Taxonomy } from "../../types";

/**
 * Checks if the given content type supports the specified type.
 *
 * @param structureType - The content type to check.
 * @param type - The type to check for support.
 * @returns A boolean indicating whether the content type supports the specified type.
 */
export function isSupports(
  structureType: ContentType | Entity | Taxonomy,
  type: string,
) {
  return structureType.supports?.findIndex((t) => t === type) !== -1;
}
