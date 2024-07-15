import {
  ChildResolverOptions,
  ListBuilder,
  ListItemBuilder,
  StructureBuilder,
  type StructureResolver,
} from "sanity/structure";
import {
  getContentTypes,
  getEntities,
  getTaxonomies,
} from "../../utils/config";
import { ContentType, TaxonomySetting } from "../../types/definition";
import { FilterIcon } from "@sanity/icons";
import { groq } from "next-sanity";
import { API_VERSION } from "../defaults/constants";

/**
 * Builds a hierarchy filter for the given content type.
 *
 * @param {StructureBuilder} S - The StructureBuilder instance.
 * @param {ContentType} contentType - The content type to build the hierarchy filter for.
 * @returns {ListItemBuilder} - The built hierarchy filter as a ListItemBuilder.
 */
function buildContentTypeHierarchyFilter(
  S: StructureBuilder,
  contentType: ContentType,
): ListItemBuilder {
  const childItem = S.documentList()
    // TODO: i18n
    .title(`${contentType.pluralTitle} by Parent`)
    .filter(`_type == "${contentType.name}" && !defined(parent)`)
    .child(async (contentTypeId, context: ChildResolverOptions) => {
      const document = await context.structureContext
        .getClient({ apiVersion: API_VERSION })
        .fetch(groq`*[_id == "${contentTypeId}"][0]{ title }`);

      return (
        S.documentTypeList(contentType.name)
          .title(document.title)
          .params({ contentTypeId })
          .filter(
            // We need to check up maximum to 5 levels deep.
            `_type == "${contentType.name}" && ($contentTypeId == parent._ref || $contentTypeId == parent->parent._ref || $contentTypeId == parent->parent->parent._ref || $contentTypeId == parent->parent->parent->parent._ref)`,
          )
          .initialValueTemplates([
            S.initialValueTemplateItem(`kit.hierarchy.${contentType.name}`, {
              parentId: contentTypeId,
            }),
          ])
      );
    });

  return (
    S.listItem()
      // TODO: i18n
      .title(`${contentType.pluralTitle} by Parent`)
      .icon(FilterIcon)
      .child(childItem)
  );
}

/**
 * Builds a list of taxonomy filters for a given content type.
 *
 * @param S - The StructureBuilder instance.
 * @param contentType - The content type for which to build the taxonomy filters.
 * @returns An array of ListItemBuilder instances representing the taxonomy filters.
 */
function buildContentTypeTaxonomyFilters(
  S: StructureBuilder,
  contentType: ContentType,
): ListItemBuilder[] {
  // TODO: i18n
  const taxonomyNames = contentType.taxonomies?.map(({ name }) => name) || [];

  // Get the taxonomies that are registered with the content type.
  const taxonomiesSettings = getTaxonomies().filter(({ name: taxonomyName }) =>
    taxonomyNames.includes(taxonomyName),
  );

  // Function to get the registered taxonomy setting in the content type.
  const getRegisteredTaxonomySetting = (taxonomyName: string) => {
    return (
      contentType?.taxonomies?.find(({ name }) => name === taxonomyName) ||
      ({} as TaxonomySetting)
    );
  };

  return taxonomiesSettings.map((taxonomy) => {
    const contentTypeTaxonomySetting = getRegisteredTaxonomySetting(
      taxonomy.name,
    );

    return (
      S.listItem()
        // TODO: i18n
        .title(`${contentType.pluralTitle} by ${taxonomy.title}`)
        .icon(FilterIcon)
        .child(
          S.documentList()
            // TODO: i18n
            .title(`${contentType.pluralTitle} by ${taxonomy.title}`)
            .filter(`_type == "${taxonomy.name}"`)
            .child(async (taxonomyId, context: ChildResolverOptions) => {
              const document = await context.structureContext
                .getClient({ apiVersion: API_VERSION })
                .fetch(groq`*[_id == "${taxonomyId}"][0]{ title }`);

              return S.documentTypeList(contentType.name)
                .title(document.title)
                .params({ taxonomyId })
                .filter(
                  // If the taxonomy setting is multiple, we need to check if the taxonomy ID is in the array.
                  `_type == "${contentType.name}" && $taxonomyId in ${contentTypeTaxonomySetting.multiple ? `${contentTypeTaxonomySetting.name}[]` : `${contentTypeTaxonomySetting.name}`}._ref`,
                )
                .initialValueTemplates([
                  S.initialValueTemplateItem(
                    `kit.filter.${contentType.name}.${taxonomy.name}`,
                    { parentId: taxonomyId },
                  ),
                ]);
            }),
        )
    );
  });
}

/**
 * Builds a content type for the Sanity Studio structure.
 *
 * @param S - The StructureBuilder instance.
 * @param name - The name of the content type.
 * @param pluralTitle - The plural title of the content type.
 * @param icon - The icon of the content type.
 * @param taxonomies - The taxonomies associated with the content type.
 * @returns The ListItemBuilder representing the content type.
 */
function buildContentType(
  S: StructureBuilder,
  contentType: ContentType,
): ListItemBuilder {
  let child: ListBuilder | null = null;

  if (contentType.taxonomies?.length || contentType.hierarchical) {
    const taxonomyNames = contentType.taxonomies?.map(({ name }) => name) || [];

    // Get the taxonomies that are registered with the content type.
    const taxonomiesSettings = getTaxonomies().filter(
      ({ name: taxonomyName }) => taxonomyNames.includes(taxonomyName),
    );

    child = S.list()
      // TODO: i18n
      .title(`Manage ${contentType.pluralTitle}`)
      .items([
        // Default document list.
        S.documentTypeListItem(contentType.name).title(contentType.pluralTitle),
        // Taxonomies pane associated with the content type.
        ...taxonomiesSettings.map((taxonomy) =>
          S.documentTypeListItem(taxonomy.name)
            .title(taxonomy.pluralTitle)
            .icon(taxonomy.icon),
        ),
        // Hierarchical filter pane.
        ...(contentType.hierarchical
          ? [buildContentTypeHierarchyFilter(S, contentType)]
          : []),
        // Taxonomy filter panes.
        ...buildContentTypeTaxonomyFilters(S, contentType),
      ]);
  }

  return S.listItem()
    .title(contentType.pluralTitle)
    .icon(contentType.icon)
    .child(
      child
        ? child
        : S.documentTypeList(contentType.name).title(contentType.pluralTitle),
    );
}

/**
 * Sanity Kit main structure resolver.
 *
 * @returns The structure resolver for the Sanity Studio.
 */
export const structure = (): StructureResolver => {
  return (S) => {
    // Build entities.
    const entities = getEntities().map((entity) =>
      S.listItem()
        .title(entity.title)
        .icon(entity.icon)
        .child(
          S.editor()
            .id(entity.name)
            .schemaType(entity.name)
            .documentId(entity.name),
        ),
    );

    // Build content types.
    const contentTypes = getContentTypes().map((contentType) =>
      buildContentType(S, contentType),
    );

    // Hide schemas that are not supposed to be visible in the structure pane.
    const hiddenSchema = [
      ...getEntities(),
      ...getContentTypes(),
      ...getTaxonomies(),
      ...[{ name: "media.tag" }],
    ].map(({ name }) => name);

    // Get the default list items that wasn't registered to Sanity Kit.
    const defaultListItems = S.documentTypeListItems().filter(
      (listItem) => !hiddenSchema.find((name) => name === listItem.getId()),
    );

    return S.list()
      .title("Structure")
      .items([...entities, S.divider(), ...contentTypes, ...defaultListItems]);
  };
};
