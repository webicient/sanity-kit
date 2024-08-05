import { serverClient } from "../serverClient";
import { HierarchyPayload } from "../../types/payload";
import { getDocumentHierarchyPath } from "../../utils/hierarchy";
import { canTranslate, getContentTypeByName, getLanguages } from "../../utils/config";
import { hierarchyQueryFields, parentQueryField } from "../../queries/hierarchy";
import { LinkablePayload } from "../../types/globals";

type GenerateStaticSlugsParams = {
  /**
   * Sanity valid document type.
   */
  type: string;
};

export async function generateStaticSlugs({ type }: GenerateStaticSlugsParams) {
  const languages = getLanguages();
  const contentTypeObject = getContentTypeByName(type);
  let docs: LinkablePayload[] = [];

  if (!contentTypeObject) {
    throw new Error(`generateStaticSlugs: Content type "${type}" not found.`);
  }

  if (canTranslate(Boolean(contentTypeObject?.translate))) {
    for (const language of languages) {
      const query = `*[_type == $type && defined(slug.${language.id})]{
        ${hierarchyQueryFields(language.id, type)}
      }`;

      const langDocs = await serverClient
        .withConfig({
          perspective: "published",
          useCdn: false,
          stega: false,
        })
        .fetch<HierarchyPayload[]>(query, { type });

      docs = langDocs;
    }

    return docs.map((doc) => {
      return {
        slug: getDocumentHierarchyPath(doc),
      };
    });
  }

  const query = `*[_type == $type && defined(slug.current)]{
    ${hierarchyQueryFields(undefined, type)}
  }`;

  docs = await serverClient
    .withConfig({
      perspective: "published",
      useCdn: false,
      stega: false,
    })
    .fetch<HierarchyPayload[]>(query, { type });

  return docs.map((doc) => {
    return {
      slug: getDocumentHierarchyPath(doc),
    };
  });
}
