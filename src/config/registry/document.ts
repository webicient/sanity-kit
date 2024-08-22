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
  Setting,
} from "../../types/definition";
import { resolveHref } from "../../utils/url";
import {
  getSupportFields,
  getTaxonomyFields,
  injectTaxonomyFields,
} from "./injector";
import {
  canTranslate,
  getDefaultLanguage,
  getLanguages,
} from "../../utils/config";

const DEFAULT_GROUP = "content";

/**
 * Translates a field definition into multiple languages.
 *
 * @param field - The field definition to translate.
 * @param defaultGroup - The default group for the translated fields.
 * @returns The translated field definition.
 */
function translateField(
  field: FieldDefinition,
  defaultGroup?: string,
): FieldDefinition {
  const { options } = field as any;

  // Skip translation if i18n is disabled.
  // TODO: Not type-safe, need to fix this.
  if (options?.translate === false) {
    return { ...field, group: field.group || DEFAULT_GROUP };
  }

  return defineField({
    title: field.title,
    name: field.name,
    type: "object",
    group: field.group || defaultGroup,
    fields: getLanguages().map((lang) =>
      defineField({
        ...field,
        title: lang.title,
        name: lang.id,
        group: undefined,
        options:
          field.type === "slug"
            ? {
                ...(field.options as any),
                isUnique: () => true,
                source: (doc: { title: Record<string, string> }) => {
                  return doc.title[lang.id];
                },
              }
            : field.options,
      }),
    ),
  });
}

/**
 * Returns the preview select object for a collection based on the specified language.
 * If no language is provided, the default select object is returned.
 *
 * @param language - The language for which to retrieve the preview select object.
 * @returns The preview select object.
 */
function getCollectionPreviewSelect(language?: string) {
  if (!language) {
    return {
      title: "title",
      slug: "slug.current",
      parentSlug: "parent.slug.current",
      ancestralSlug: "parent.parent.slug.current",
      unknownSlug: "parent.parent.parent",
    };
  }

  return {
    title: `title.${language}`,
    slug: `slug.${language}.current`,
    parentSlug: `parent.slug.${language}.current`,
    ancestralSlug: `parent.parent.slug.${language}.current`,
    unknownSlug: `parent.parent.parent`,
  };
}

/**
 * Retrieves the collection document based on the provided type and configuration.
 *
 * @param type - The type of the collection document.
 * @param {settings} - The settings object containing the document properties.
 * @returns The collection document.
 */
function getCollectionDocument(
  type: string,
  {
    name,
    title,
    icon,
    groups = [],
    fields = [],
    supports = ["title", "slug", "seo"],
    translate = false,
    ...collection
  }: ContentType | Taxonomy,
) {
  let docFields: FieldDefinition[] = [...getSupportFields(supports), ...fields];
  let docPreview: PreviewConfig | undefined = undefined;
  let docGroups = [...coreGroups, ...groups];

  docFields = docFields.map((field) => {
    return canTranslate(translate)
      ? translateField(field, DEFAULT_GROUP)
      : { ...field, group: field.group || DEFAULT_GROUP };
  }) as FieldDefinition[];

  if (type === "contentType") {
    const {
      taxonomies = [],
      rewrite,
      hierarchical,
    } = collection as ContentType;

    if (rewrite) {
      docPreview = {
        select: getCollectionPreviewSelect(
          canTranslate(translate) ? getDefaultLanguage()?.id : undefined,
        ),
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

    docFields = injectTaxonomyFields(docFields, getTaxonomyFields(taxonomies));

    if (hierarchical) {
      docFields.push(
        defineField({
          name: "parent",
          title: "Parent",
          type: "reference",
          to: [{ type: name }],
          group: "content",
        }),
      );
    }
  } else {
    docPreview = {
      select: getCollectionPreviewSelect(
        canTranslate(translate) ? getDefaultLanguage()?.id : undefined,
      ),
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
          subtitle: slug ? resolveHref(name, { slug: pathSegment }) : undefined,
        };
      },
    };
  }

  return defineType({
    type: "document",
    name,
    title,
    icon,
    groups: docGroups,
    fields: docFields,
    preview: docPreview,
    ...collection,
  });
}

/**
 * Retrieves a singleton document definition based on the provided type and settings.
 *
 * @param type - The type of the document (either "setting" or "entity").
 * @param {settings} - The settings object containing the document properties.
 * @returns The singleton document definition.
 */
function getSingletonDocument(
  type: string,
  {
    name,
    title,
    icon,
    groups = [],
    fields = [],
    translate = false,
    ...singleton
  }: Setting | Entity,
) {
  let docFields: FieldDefinition[] = fields;
  let docGroups: DocumentDefinition["groups"] = groups;

  if (type === "entity") {
    const { supports = [] } = singleton as Entity;
    docGroups = [...coreGroups, ...groups];
    docFields = [...getSupportFields(supports), ...fields].map((field) => {
      return canTranslate(translate)
        ? translateField(field)
        : { ...field, group: field.group || DEFAULT_GROUP };
    }) as FieldDefinition[];
  } else {
    docFields = [...fields].map((field) => {
      return canTranslate(translate) ? translateField(field) : field;
    }) as FieldDefinition[];
  }

  return defineType({
    type: "document",
    name,
    title,
    icon,
    groups: docGroups,
    fields: docFields,
    preview: {
      prepare: () => ({ title }),
    },
    ...singleton,
  });
}

/**
 * Returns a module document.
 *
 * @param {Module} module - The module object.
 * @returns The module document.
 */
function getModuleDocument({
  name,
  title,
  icon,
  groups = [],
  fields = [],
  imageUrl,
  ...module
}: Module) {
  return defineType({
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
  });
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
  return collections.map((collection) =>
    getCollectionDocument(type, collection),
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
  singletons: Entity[] | Setting[],
): DocumentDefinition[] {
  return singletons.map((singleton) => getSingletonDocument(type, singleton));
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
  return modules.map((module) => getModuleDocument(module));
}
