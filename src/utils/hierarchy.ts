import { HierarchyPayload } from "../types";

/**
 * Retrieves the hierarchy path of a document.
 *
 * @param document - The document with hierarchy information.
 * @returns An array representing the hierarchy path of the document.
 */
export function getDocumentHierarchyPath(document: HierarchyPayload) {
  const hierarchy = [];
  let currentDoc: HierarchyPayload | null | undefined = document;

  while (currentDoc) {
    hierarchy.unshift(currentDoc.slug.current);
    currentDoc = currentDoc?.parent;
  }

  return hierarchy;
}
