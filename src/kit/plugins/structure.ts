import {
  ListItemBuilder,
  StructureBuilder,
  type StructureResolver,
} from "sanity/structure";
import {
  getContentTypes,
  getEntities,
  getTaxonomies,
} from "../../utils/config";
import { ContentType, Taxonomy } from "../../types/definition";

function buildTaxonomy(
  S: StructureBuilder,
  { name, pluralTitle, icon }: Taxonomy,
) {
  return S.documentTypeListItem(name).title(pluralTitle).icon(icon);
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
  { name, pluralTitle, icon, taxonomies }: ContentType,
): ListItemBuilder {
  let child = null;

  if (!taxonomies?.length) {
    child = S.documentTypeList(name).title(pluralTitle);
  } else {
    // TODO: Improve for translations.
    const panelTitle = `Manage ${pluralTitle}`;
    const taxonomyNames = taxonomies.map(({ name }) => name);

    child = S.list()
      .title(panelTitle)
      .items([
        S.documentTypeListItem(name).title(pluralTitle),
        ...getTaxonomies()
          .filter(({ name: taxonomyName }) =>
            taxonomyNames.includes(taxonomyName),
          )
          .map((taxonomy) => buildTaxonomy(S, taxonomy)),
      ]);
  }

  return S.listItem().title(pluralTitle).icon(icon).child(child);
}

export const structure = (): StructureResolver => {
  return (S) => {
    const entities = getEntities().map(({ name, title, icon }) =>
      S.listItem()
        .title(title)
        .icon(icon)
        .child(S.editor().id(name).schemaType(name).documentId(name)),
    );

    const contentTypes = getContentTypes().map((contentType) =>
      buildContentType(S, contentType),
    );

    const hiddenSchema = [
      ...getEntities(),
      ...getContentTypes(),
      ...getTaxonomies(),
      ...[{ name: "media.tag" }],
    ].map(({ name }) => name);

    const defaultListItems = S.documentTypeListItems().filter(
      (listItem) => !hiddenSchema.find((name) => name === listItem.getId()),
    );

    return S.list()
      .title("Structure")
      .items([...entities, S.divider(), ...contentTypes, ...defaultListItems]);
  };
};
