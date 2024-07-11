import {
  defineType,
  type FieldDefinition,
  defineField,
  type DocumentDefinition,
} from "sanity";
import { coreFields } from "./defaults/fields";
import { coreGroups } from "./defaults/groups";
import { getTaxonomies } from "../utils/config";
import { type ValidCollectionType } from "../types/validity";
import {
  type Entity,
  type ContentType,
  type Taxonomy,
  TaxonomySetting,
} from "../types/definition";
import { type CollectionSupports } from "../types/core";

/**
 * Retrieves the field definitions for the given support types.
 *
 * @param supports - An array of support types.
 * @returns An array of field definitions.
 */
export const getSupportFields = (
  supports: CollectionSupports[],
): FieldDefinition[] =>
  supports.map((support) => coreFields[support]).filter(Boolean);

/**
 * Retrieves relational fields based on the provided taxonomies.
 *
 * @param taxonomies - An array of strings representing the taxonomies.
 * @returns An array of FieldDefinition objects representing the relational fields.
 */
export const getRelationalFields = (
  taxonomies: TaxonomySetting[],
): FieldDefinition[] =>
  taxonomies
    .map((_taxonomy) => {
      // Find the taxonomy object.
      const taxonomy = getTaxonomies().find(
        ({ name }) => name === _taxonomy.name,
      );

      // Taxonomy not found, then return null.
      if (!taxonomy) {
        return null;
      }

      if (_taxonomy.multiple) {
        return defineField({
          name: taxonomy.name,
          title: taxonomy.pluralTitle || taxonomy.title,
          type: "array",
          group: "content",
          of: [
            {
              type: "reference",
              to: [{ type: taxonomy.name }],
            },
          ],
          validation: (Rule) => (_taxonomy.required ? Rule.required() : Rule),
        });
      }

      return defineField({
        name: taxonomy.name,
        title: taxonomy.pluralTitle || taxonomy.title,
        type: "reference",
        to: [{ type: taxonomy.name }],
        group: "content",
        validation: (Rule) => (_taxonomy.required ? Rule.required() : Rule),
      });
    })
    .filter(Boolean) as FieldDefinition[];

/**
 * Injects relational fields into an array of field definitions.
 * If the array of relational fields is empty, the original array is returned.
 * If a field with the name "slug" or "title" exists in the original array, the relational fields are inserted after that field.
 * Otherwise, the relational fields are inserted at the beginning of the original array.
 *
 * @param fields - The original array of field definitions.
 * @param relationalFields - The array of relational fields to be injected.
 * @returns The modified array of field definitions with the relational fields injected.
 */
export function injectRelationalFields(
  fields: FieldDefinition[],
  relationalFields: FieldDefinition[],
): FieldDefinition[] {
  if (relationalFields.length === 0) {
    return fields;
  }

  const targetIndex = ["slug", "title"].reduce((acc, fieldName) => {
    return acc >= 0
      ? acc
      : fields.findIndex((field) => field.name === fieldName);
  }, -1);

  if (targetIndex >= 0) {
    return fields.reduce<FieldDefinition[]>(
      (acc, field) =>
        fields[targetIndex].name === field.name
          ? [...acc, field, ...relationalFields]
          : [...acc, field],
      [],
    );
  }

  return [...relationalFields, ...fields];
}

/**
 * Normalizes collections based on the given type and collections array. This function
 * will convert the collections into an array of DocumentDefinitions that can be used
 * for defining schemas in Sanity.
 *
 * @param type - The type of the collection ("contentType" or "taxonomy").
 * @param collections - An array of collections to be normalized.
 * @returns An array of normalized DocumentDefinitions.
 */
export function normalizeCollections(
  type: ValidCollectionType,
  collections: (ContentType | Taxonomy)[],
): DocumentDefinition[] {
  return collections.map(
    ({
      name,
      title,
      icon,
      groups = [],
      fields = [],
      supports = ["title", "slug", "seo"],
      ...collection
    }) => {
      let defaultFields: FieldDefinition[] = getSupportFields(supports);

      if (type === "contentType") {
        // We can safely assume it's a ContentType now
        const { taxonomies = [] } = collection as ContentType;

        defaultFields = injectRelationalFields(
          defaultFields,
          getRelationalFields(taxonomies),
        );
      }

      return defineType({
        type: "document",
        name,
        title,
        icon,
        groups: [...coreGroups, ...groups],
        fields: [...defaultFields, ...fields],
      });
    },
  );
}

/**
 * Normalizes an array of entities.
 *
 * @param entities - The array of entities to normalize.
 * @returns An array of normalized entities.
 */
export function normalizeSingletons(entities: Entity[]): DocumentDefinition[] {
  return entities.map(({ name, title, icon, groups = [], fields = [] }) =>
    defineType({
      type: "document",
      name,
      title,
      icon,
      groups,
      fields,
    }),
  );
}
