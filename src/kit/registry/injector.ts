import { defineField, FieldDefinition } from "sanity";
import { TaxonomySetting } from "../../types/definition";
import { getTaxonomies } from "../../utils/config";
import { CollectionSupports } from "../../types/core";
import { coreFields } from "../defaults/fields";

/**
 * Retrieves the field definitions for the given support types.
 *
 * @param supports - An array of support types.
 * @returns An array of field definitions.
 */
export function getSupportFields(
  supports: CollectionSupports[],
): FieldDefinition[] {
  return supports.map((support) => coreFields[support]).filter(Boolean);
}

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
export function injectTaxonomyFields(
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
 * Retrieves relational fields based on the provided taxonomies.
 *
 * @param taxonomies - An array of strings representing the taxonomies.
 * @returns An array of FieldDefinition objects representing the relational fields.
 */
export function getTaxonomyFields(
  taxonomies: TaxonomySetting[],
): FieldDefinition[] {
  return taxonomies
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
          validation: (Rule) => (_taxonomy.required ? Rule.required() : Rule),
          of: [
            {
              type: "reference",
              to: [{ type: taxonomy.name }],
            },
          ],
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
}
