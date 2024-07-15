import { client } from "./client";

/**
 * Maximum depth of nested documents to retrieve.
 */
const MAX_DEPTH = 10;

type Options = {
  depth?: number;
};

/**
 * Retrieves the hierarchy of a document by its ID.
 *
 * @param documentId - The ID of the document.
 * @param options - Additional options for retrieving the hierarchy.
 * @returns An array representing the hierarchy of the document.
 */
export async function getHierarchyById(
  documentId: string | null,
  options: Options,
) {
  const composeQuery = (depth: number = MAX_DEPTH): string => {
    return `"parent": parent->{ _id, "slug": slug.current, ${depth > 0 ? composeQuery(depth - 1) : ""}}`;
  };

  const query = `
    *[_id == $id][0] {
      _id,
      "slug": slug.current,
      ${composeQuery(options.depth)}
    }
  `;

  const result = await client.fetch(query, { id: documentId });

  let hierarchy = [];
  let currentDoc = result;

  while (currentDoc) {
    hierarchy.unshift({ slug: currentDoc.slug });
    currentDoc = currentDoc.parent;
  }

  return hierarchy;
}
