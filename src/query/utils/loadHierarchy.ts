import { Slug } from "sanity";
import { loadQuery } from "../loadQuery";
import { composeParentFieldQuery } from "../../utils/groq";

type Options = {
  /**
   * The maximum depth of nested documents to retrieve.
   */
  depth?: number;
};

export interface WithHierarchyPayload {
  _id: string;
  title: string;
  slug: Slug;
  parent?: WithHierarchyPayload | null;
}

/**
 * Retrieves the hierarchy path of a document.
 *
 * @param document - The document with hierarchy information.
 * @returns An array representing the hierarchy path of the document.
 */
export function getDocumentHierarchyPath(document: WithHierarchyPayload) {
  const hierarchy = [];
  let currentDoc: WithHierarchyPayload | null | undefined = document;

  while (currentDoc) {
    hierarchy.unshift({ slug: currentDoc.slug.current });
    currentDoc = currentDoc?.parent;
  }

  return hierarchy;
}

/**
 * Retrieves the hierarchy of a document by its ID.
 *
 * @param documentId - The ID of the document.
 * @param options - Additional options for retrieving the hierarchy.
 * @returns An array representing the hierarchy of the document.
 */
export async function loadHierarchy(documentId: string, options: Options) {
  const query = `
    *[_id == $id][0] {
      _id,
      _type,
      title,
      slug,
      ${composeParentFieldQuery(options.depth)}
    }
  `;

  const { data } = await loadQuery<WithHierarchyPayload>(
    query,
    { id: documentId },
    { next: { tags: [documentId] } },
  );

  return data;
}
