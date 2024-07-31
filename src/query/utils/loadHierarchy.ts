import { loadQuery } from "../loadQuery";
import { composeParentFieldQuery } from "../../utils/groq";
import { HierarchyPayload } from "../../types";

type Options = {
  /**
   * The maximum depth of nested documents to retrieve.
   */
  depth?: number;
};

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

  return await loadQuery<HierarchyPayload>(
    query,
    { id: documentId },
    { next: { tags: [documentId] } },
  );
}
