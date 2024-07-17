import { ResolveProductionUrlContext } from "sanity";
import { resolveHref } from "../../utils/url";
import { API_VERSION } from "../defaults/constants";
import { SanityClient } from "sanity";

const MAX_DEPTH = 10;

/**
 * Gets the document hierarchy for a given document.
 *
 * @param client - The Sanity client instance.
 * @param documentId - The ID of the document to get the hierarchy for.
 * @returns A promise that resolves to the document hierarchy.
 */
async function getDocumentHierarchy(
  client: SanityClient,
  documentId: string | null,
) {
  const composeQuery = (depth: number = MAX_DEPTH): string => {
    return `"parent": parent->{ _id, "slug": slug.current, ${depth > 0 ? composeQuery(depth - 1) : ""}}`;
  };

  const query = `
    *[_id == $id][0] {
      _id,
      "slug": slug.current,
      ${composeQuery(MAX_DEPTH)}
    }
  `;

  const result = await client.fetch(query, { id: documentId });

  let hierarchy = [];
  let currentDoc = result;

  while (currentDoc) {
    hierarchy.unshift({ id: currentDoc._id, slug: currentDoc.slug });
    currentDoc = currentDoc.parent;
  }

  return hierarchy;
}

/**
 * Resolves the production URL for a document.
 *
 * @param prev - The previous production URL.
 * @param context - The context object containing the necessary information.
 * @returns A promise that resolves to the production URL for the document, or undefined if it cannot be resolved.
 */
export async function productionUrl(
  prev: string,
  context: ResolveProductionUrlContext,
): Promise<string | undefined> {
  const { getClient, document } = context;

  const slugSegments = await getDocumentHierarchy(
    getClient({ apiVersion: API_VERSION }),
    document._id,
  );

  return (
    resolveHref(
      document._type,
      slugSegments.map(({ slug }) => slug).join("/"),
    ) || prev
  );
}
