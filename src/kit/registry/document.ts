import {
  defineType,
  type FieldDefinition,
  defineField,
  type DocumentDefinition,
  PreviewConfig,
} from "sanity";
import { coreGroups } from "../defaults/groups";
import { type ValidCollectionType } from "../../types/validity";
import {
  type ContentType,
  type Taxonomy,
  type Singleton,
} from "../../types/definition";
import { resolveHref } from "../../utils/url";
import {
  getSupportFields,
  getTaxonomyFields,
  injectTaxonomyFields,
} from "./injector";

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

      // Custom preview handler.
      let preview: PreviewConfig | undefined = undefined;

      if (type === "contentType") {
        // We can safely assume it's a ContentType now.
        const {
          taxonomies = [],
          rewrite,
          hierarchical,
        } = collection as ContentType;

        defaultFields = injectTaxonomyFields(
          defaultFields,
          getTaxonomyFields(taxonomies),
        );

        if (hierarchical) {
          defaultFields.push(
            defineField({
              name: "parent",
              title: "Parent",
              type: "reference",
              to: [{ type: name }],
              group: "content",
            }),
          );
        }

        if (rewrite) {
          preview = {
            select: {
              title: "title",
              slug: "slug.current",
              parentSlug: "parent.slug.current",
              ancestralSlug: "parent.parent.slug.current",
              unknownSlug: "parent.parent.parent",
            },
            prepare({ title, slug, parentSlug, ancestralSlug, unknownSlug }) {
              const pathSegment = [
                unknownSlug ? "..." : "",
                ancestralSlug,
                parentSlug,
                slug,
              ]
                .filter(Boolean)
                .join("/");

              return {
                title,
                subtitle: slug ? resolveHref(name, pathSegment) : undefined,
              };
            },
          };
        }
      }

      return defineType({
        type: "document",
        name,
        title,
        icon,
        groups: [...coreGroups, ...groups],
        fields: [...defaultFields, ...fields],
        preview,
        ...collection,
      });
    },
  );
}

/**
 * Normalizes an array of singletons.
 *
 * @param singletons - The array of singletons to normalize.
 * @returns An array of normalized singletons.
 */
export function normalizeSingletons(
  singletons: Singleton[],
): DocumentDefinition[] {
  return singletons.map(({ name, title, icon, groups = [], fields = [], ...singleton }) =>
    defineType({
      type: "document",
      name,
      title,
      icon,
      groups,
      fields,
      preview: {
        prepare: () => ({ title }),
      },
      ...singleton,
    }),
  );
}
