import { ResolveProductionUrlContext } from "sanity";
import { API_VERSION } from "../defaults/constants";
import { getDefaultLanguage } from "../../utils/config";
import { hierarchyQueryFields } from "../../queries/hierarchy";
import groq from "groq";
import { resolveDocumentHref } from "../../utils/url";

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

  if (!document?._type) {
    return undefined;
  }

  const defaultLanguageId = getDefaultLanguage()?.id;

  const query = groq`
    *[_id == $id][0] {
      ${hierarchyQueryFields(defaultLanguageId, document._type)}
    }
  `;

  const result = await getClient({ apiVersion: API_VERSION }).fetch(query, {
    id: document._id,
  });

  return defaultLanguageId
    ? `/${defaultLanguageId}/${resolveDocumentHref(result)}`
    : resolveDocumentHref(result);
}
