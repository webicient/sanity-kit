import { Template, TemplateResolver } from "sanity";
import { getContentTypes, getTaxonomyByName } from "../../utils/config";

/**
 * Handle content type templates.
 *
 * @returns Custom intent templates for content types.
 */
function contentTypeTemplate(): Template[] {
  const templates: Template[] = [];

  getContentTypes().forEach((contentType) => {
    // If the content type is hierarchical, we will create a template for to handle creation intent.
    // This template handles e.g. "Parent Pages" document creation intent in its sub pane.
    if (contentType.hierarchical) {
      templates.push({
        id: `kit.hierarchy.${contentType.name}`,
        // TODO: i18n
        title: `Hierarchy for ${contentType.pluralTitle}`,
        schemaType: contentType.name,
        parameters: [
          // TODO: i18n
          { name: `parentId`, title: `Parent ID`, type: `string` },
        ],
        value: ({ parentId }: { parentId: string }) => ({
          parent: { _type: "reference", _ref: parentId },
        }),
      });
    }

    // If there's a taxonomy connected to this content type, we will create a template for it.
    // This templates handles e.g. "Post by Category" document creation intent in its sub pane.
    if (Boolean(contentType.taxonomies?.length)) {
      contentType.taxonomies?.forEach(({ name: taxonomyId, multiple }) => {
        const taxonomy = getTaxonomyByName(taxonomyId);

        if (taxonomy) {
          templates.push({
            id: `kit.filter.${contentType.name}.${taxonomy.name}`,
            // TODO: i18n
            title: `${contentType.pluralTitle} by ${taxonomy.title}`,
            schemaType: contentType.name,
            parameters: [
              // TODO: i18n
              { name: `parentId`, title: `Parent ID`, type: `string` },
            ],
            value: ({ parentId }: { parentId: string }) => ({
              [`${taxonomy.name}`]: multiple
                ? [{ _type: "reference", _ref: parentId }]
                : { _type: "reference", _ref: parentId },
            }),
          });
        }
      });
    }
  });

  return templates;
}

/**
 * Handles all templates for Sanity Kit.
 *
 * @returns A template resolver.
 */
export function template(): TemplateResolver {
  return (prev) => {
    return [...prev, ...contentTypeTemplate()];
  };
}
