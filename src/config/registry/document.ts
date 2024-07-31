import {
  defineType,
  defineField,
  type PreviewConfig,
  type FieldDefinition,
  type DocumentDefinition,
} from "sanity";
import { coreGroups } from "../defaults/groups";
import {
  ValidSingletonType,
  type ValidCollectionType,
} from "../../types/validity";
import {
  type ContentType,
  type Taxonomy,
  type Module,
  type Entity,
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
                subtitle: slug
                  ? resolveHref(name, { slug: pathSegment })
                  : undefined,
              };
            },
          };
        }
      }

      // Merge the core groups with the custom groups.
      const _groups = [...coreGroups, ...groups];
      // Ensure that all fields have a group.
      const _fields = [...defaultFields, ...fields].map((field) => {
        if (_groups.some((group) => group.name === field.group)) {
          return field;
        }

        return {
          ...field,
          group: "content",
        };
      });

      return defineType({
        type: "document",
        name,
        title,
        icon,
        groups: _groups,
        fields: _fields,
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
  type: ValidSingletonType,
  singletons: Entity[],
): DocumentDefinition[] {
  return singletons.map(
    ({
      name,
      title,
      icon,
      groups = [],
      fields = [],
      supports = [],
      ...singleton
    }) => {
      let defaultFields: FieldDefinition[] = getSupportFields(supports);
      let _groups = groups;
      let _fields = fields;

      if (type === "entity") {
        // Merge the core groups with the custom groups.
        _groups = [...coreGroups, ...groups];
        // Ensure that all fields have a group.
        _fields = [...defaultFields, ...fields].map((field) => {
          if (_groups.some((group) => group.name === field.group)) {
            return field;
          }

          return {
            ...field,
            group: "content",
          };
        });
      }

      return defineType({
        type: "document",
        name,
        title,
        icon,
        groups: _groups,
        fields: _fields,
        preview: {
          prepare: () => ({ title }),
        },
        ...singleton,
      });
    },
  );
}

/**
 * Normalizes an array of modules and returns an array of defined types.
 *
 * @param modules - The array of modules to normalize.
 * @returns An array of defined types.
 */
export function normalizeModules(
  modules: Module[],
): ReturnType<typeof defineType>[] {
  return modules.map(
    ({ name, title, icon, groups = [], fields = [], imageUrl, ...module }) =>
      defineType({
        type: "object",
        name,
        title,
        icon,
        groups,
        fields,
        preview: {
          prepare: () => ({ title, imageUrl: imageUrl || undefined }),
        },
        ...module,
      }),
  );
}
