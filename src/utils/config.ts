import { getConfig } from "../config/kitConfig";
import {
  Module,
  Setting,
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
 * Get settings from the configuration.
 *
 * @returns Get all settings.
 */
export function getSettings(): Setting[] {
  return getConfig().schema?.settings ?? [];
}

/**
 * Retrieves the modules from the configuration.
 *
 * @returns An array of modules.
 */
export function getModules(): Module[] {
  return getConfig().schema?.modules ?? [];
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

/**
 * Retrieves a content type object by its name.
 *
 * @param name - The name of the content type to retrieve.
 * @returns The content type object with the specified name, or undefined if not found.
 */
export function getContentTypeByName(name: string): ContentType | undefined {
  return getContentTypes().find((contentType) => contentType.name === name);
}

/**
 * Retrieves an entity by its name.
 *
 * @param name - The name of the entity to retrieve.
 * @returns The entity with the specified name, or undefined if not found.
 */
export function getEntityByName(name: string): Entity | undefined {
  return getEntities().find((entity) => entity.name === name);
}

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
