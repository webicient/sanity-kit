import {
  type Entity,
  type Taxonomy,
  type ContentType,
  type Setting,
} from "../../types/definition";

/**
 * Entities are used to define custom data structures that are not content types or taxonomies. It is
 * usually used to create settings, options, or other data structures that are not content types or
 * taxonomies.
 */
export function defineEntity(entity: Entity): Entity {
  return entity;
}

/**
 * Defines a setting, similar to an entity, but with a different menu group.
 * Every setting is a singleton stored under `Settings` in the Sanity Studio.
 *
 * @param setting - The setting to define.
 * @returns The defined setting.
 */
export function defineSetting(setting: Setting): Setting {
  return setting;
}

/**
 * Content types are the primary way to structure and organize content in Sanity Studio. Consider
 * content type as your collection of post, blog, page, etc.
 */
export function defineContentType(contentType: ContentType): ContentType {
  return contentType;
}

/**
 * Taxonomies are used to group content types into categories or tags. For example, you might have a
 * taxonomy called "Categories" that groups content types like "Post" and "Page" into categories like
 * "News", "Blog", etc.
 */
export function defineTaxonomy(taxonomy: Taxonomy): Taxonomy {
  return taxonomy;
}
