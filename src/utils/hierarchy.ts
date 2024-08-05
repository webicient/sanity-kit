import { LinkablePayload } from "../types/globals";
import { InternalLinkPayload } from "../types/object";
import { ContentTypePayload, HierarchyPayload } from "../types/payload";

/**
 * Retrieves the hierarchy path of a document.
 *
 * @param document - The document with hierarchy information.
 * @returns An array representing the hierarchy path of the document.
 */
export function getDocumentHierarchyPath(document: LinkablePayload) {
  const hierarchy = [];
  let currentDoc:
    | HierarchyPayload
    | InternalLinkPayload
    | ContentTypePayload
    | null
    | undefined = document;

  while (currentDoc) {
    hierarchy.unshift(currentDoc.slug.current);
    currentDoc = currentDoc?.parent;
  }

  return hierarchy;
}
