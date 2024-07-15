import { getConfig } from "../kit/kitConfig";
import {
  type ContentType,
  type Entity,
  type Taxonomy,
} from "../types/definition";

/**
 * Get entities from the configuration.
 *
 * @returns Get all entities.
 */
export function getEntities(): Entity[] {
  return getConfig().schema?.entities ?? [];
}

/**
 * Get content types from the configuration.
 *
 * @returns Get all content types.
 */
export function getContentTypes(): ContentType[] {
  return getConfig().schema?.contentTypes ?? [];
}

/**
 * Get taxonomies from the configuration.
 *
 * @returns Get all taxonomies.
 */
export function getTaxonomies(): Taxonomy[] {
  return getConfig().schema?.taxonomies ?? [];
}

/**
 * Retrieves a taxonomy by its name.
 *
 * @param name - The name of the taxonomy to retrieve.
 * @returns The taxonomy object if found, otherwise undefined.
 */
export function getTaxonomyByName(name: string): Taxonomy | undefined {
  return getTaxonomies().find((taxonomy) => taxonomy.name === name);
}
