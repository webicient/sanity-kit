import {
  ChildResolverOptions,
  Divider,
  ListBuilder,
  ListItem,
  ListItemBuilder,
  StructureBuilder,
  type StructureResolver,
} from "sanity/structure";
import {
  canTranslate,
  getContentTypes,
  getDefaultLanguage,
  getEntities,
  getSchemaByName,
  getSettings,
  getStructures,
  getTaxonomies,
} from "../../utils/config";
import {
  ContentType,
  ContentTypeTaxonomy,
  Entity,
  Structure,
} from "../../types/definition";
import { CogIcon, FilterIcon } from "@sanity/icons";
import { groq } from "next-sanity";
import { API_VERSION } from "../defaults/constants";

const LEVEL_1 = 1;
const LEVEL_2 = 2;
const LEVEL_3 = 3;
const LEVEL_4 = 4;
const LEVEL_5 = 5;

/**
 * Adds a type to each item in the given array.
 *
 * @param items - The array of items to add the type to.
 * @param type - The type to add to each item.
 * @returns The array of items with the type added.
 */
function prepareBuild(
  items: Entity[] | ContentType[] | Structure[],
  type: "entity" | "contentType" | "structure",
  defaultLevel: number,
): Entity[] | ContentType[] | Structure[] {
  return items.map((item) => {
    return {
      type: type,
      menu: item.menu ? item.menu : { level: defaultLevel },
      ...item,
    };
  }) as any;
}

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
): ListItemBuilder[] | [] {
  const schemaObject = getSchemaByName(contentType.name);

  if (!schemaObject) {
    return [];
  }

  const childItem = S.documentList()
    // TODO: i18n
    .title(`${contentType.pluralTitle} by Parent`)
    .filter(`_type == "${contentType.name}" && !defined(parent)`)
    .child(async (contentTypeId, context: ChildResolverOptions) => {
      const document = await context.structureContext
        .getClient({ apiVersion: API_VERSION })
        .fetch(groq`*[_id == "${contentTypeId}"][0]{ title }`);

      const defaultLanguage = getDefaultLanguage()?.id;
      let title = document.title;

      if (canTranslate(Boolean(schemaObject?.translate)) && defaultLanguage) {
        title = document.title[defaultLanguage];
      }

      return S.documentTypeList(contentType.name)
        .title(title)
        .params({ contentTypeId })
        .filter(
          // We need to check up maximum to 5 levels deep.
          `_type == "${contentType.name}" && ($contentTypeId == parent._ref || $contentTypeId == parent->parent._ref || $contentTypeId == parent->parent->parent._ref || $contentTypeId == parent->parent->parent->parent._ref)`,
        )
        .initialValueTemplates([
          S.initialValueTemplateItem(`kit.hierarchy.${contentType.name}`, {
            parentId: contentTypeId,
          }),
        ]);
    });

  return [
    S.listItem()
      // TODO: i18n
      .title(`${contentType.pluralTitle} by Parent`)
      .icon(FilterIcon)
      .child(childItem),
  ];
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
      ({} as ContentTypeTaxonomy)
    );
  };

  const schemaObject = getSchemaByName(contentType.name);

  if (!schemaObject) {
    return [];
  }

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

              const defaultLanguage = getDefaultLanguage()?.id;
              let title = document.title;

              if (
                canTranslate(Boolean(schemaObject?.translate)) &&
                defaultLanguage
              ) {
                title = document.title[defaultLanguage];
              }

              return S.documentTypeList(contentType.name)
                .title(title)
                .params({ taxonomyId })
                .filter(
                  // If the taxonomy setting is multiple, we need to check if the taxonomy ID is in the array.
                  `_type == "${contentType.name}" && ${contentTypeTaxonomySetting.multiple ? `$taxonomyId in ${contentTypeTaxonomySetting.name}[]` : `${contentTypeTaxonomySetting.name}`}._ref == $taxonomyId`,
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
          ? buildContentTypeHierarchyFilter(S, contentType)
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
 * Builds the settings structure.
 *
 * @param {StructureBuilder} S - The StructureBuilder instance.
 * @returns {ListItemBuilder} The settings list item.
 */
function buildSettings(S: StructureBuilder): ListItemBuilder {
  return S.listItem()
    .title("Settings")
    .icon(CogIcon)
    .child(
      S.list()
        .title("Settings")
        .items([
          ...getSettings().map((setting) =>
            S.listItem()
              .title(setting.title)
              .icon(setting.icon)
              .child(
                S.editor()
                  .id(setting.name)
                  .schemaType(setting.name)
                  .documentId(setting.name),
              ),
          ),
        ]),
    );
}

/**
 * Builds a list item for the given entity.
 *
 * @param S - The StructureBuilder instance.
 * @param entity - The entity object.
 * @returns The ListItemBuilder instance.
 */
function buildEntity(S: StructureBuilder, entity: Entity): ListItemBuilder {
  return S.listItem()
    .title(entity.title)
    .icon(entity.icon)
    .child(
      S.editor()
        .id(entity.name)
        .schemaType(entity.name)
        .documentId(entity.name),
    );
}

/**
 * Builds a custom list item structure.
 *
 * @param {StructureBuilder} S - The StructureBuilder instance.
 * @param {Structure} structure - The structure to build.
 * @returns The built structure.
 */
function buildStructure(S: StructureBuilder, structure: Structure): any {
  return structure.builder ? structure.builder(S) : null;
}

/**
 * Builds an entity or content type based on the provided item.
 *
 * @param {StructureBuilder} S - The StructureBuilder instance.
 * @param {Entity & WithType | ContentType & WithType | Structure} item - The item to build.
 * @returns {ListItemBuilder | null} The built entity or content type as a ListItemBuilder, or null if the item type is not recognized.
 */
function maybeBuildEntitiesOrContentTypes(
  S: StructureBuilder,
  group: number,
  items: ContentType[] | Entity[] | Structure[],
): ListItemBuilder[] {
  return items
    .filter(({ menu }) => menu?.level === group)
    .map((schema: any) => {
      switch (schema.type) {
        case "entity":
          return buildEntity(S, schema);
        case "contentType":
          return buildContentType(S, schema);
        case "structure":
          return buildStructure(S, schema);
        default:
          return null;
      }
    })
    .filter(Boolean) as ListItemBuilder[];
}

/**
 * Sanity Kit main structure resolver.
 *
 * @returns The structure resolver for the Sanity Studio.
 */
export const structure = (): StructureResolver => {
  return (S) => {
    // Hide schemas that are not supposed to be visible in the structure pane.
    const hiddenSchema = [
      ...getEntities(),
      ...getContentTypes(),
      ...getTaxonomies(),
      ...getSettings(),
      ...[{ name: "media.tag" }],
    ].map(({ name }) => name);

    // Get the default list items that wasn't registered to Sanity Kit.
    const defaultListItems = S.documentTypeListItems().filter(
      (listItem) => !hiddenSchema.find((name) => name === listItem.getId()),
    );

    // Moveable schema are entities and content types. This is used to determine the order of the schema in the structure pane.
    const moveableSchema = [
      ...prepareBuild(getEntities(), "entity", LEVEL_1),
      ...prepareBuild(getContentTypes(), "contentType", LEVEL_2),
      ...prepareBuild(getStructures(), "structure", LEVEL_2),
    ];

    let child: (ListItemBuilder | ListItem | Divider)[] = [];

    // Level 1 is reserved for the entities.
    child = [
      ...child,
      ...maybeBuildEntitiesOrContentTypes(S, LEVEL_1, moveableSchema),
      S.divider(),
    ];

    // Level 2 is reserved for the content types.
    child = [
      ...child,
      ...maybeBuildEntitiesOrContentTypes(S, LEVEL_2, moveableSchema),
      S.divider(),
    ];

    // Level 3 is reserved other types that was registered directly to Sanity config.
    const levelThreeGroup = [
      ...maybeBuildEntitiesOrContentTypes(S, LEVEL_3, moveableSchema),
      ...defaultListItems,
    ];

    if (levelThreeGroup.length) {
      child = [...child, ...levelThreeGroup, S.divider()];
    }

    // Level 4 is reserved for the settings.
    child = [
      ...child,
      ...maybeBuildEntitiesOrContentTypes(S, LEVEL_4, moveableSchema),
      buildSettings(S),
    ];

    // Level 5 is reserved other types that was registered directly to Sanity config.
    const levelFiveGroup = [
      ...maybeBuildEntitiesOrContentTypes(S, LEVEL_5, moveableSchema),
    ];

    if (levelFiveGroup.length) {
      child = [...child, S.divider(), ...levelFiveGroup];
    }

    // TODO: i18n
    return S.list().title("Structure").items(child);
  };
};
