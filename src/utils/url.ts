import { getContentTypes } from "./config";

/**
 * Adds a trailing slash to the given string if it doesn't already have one.
 *
 * @param str - The string to add a trailing slash to.
 * @returns The string with a trailing slash.
 */
function addTrailingSlash(str: string) {
  return str.endsWith("/") ? str : str + "/";
}

/**
 * Resolves the href for a document based on its document type and slug.
 *
 * @param documentType - The document type.
 * @param slug - The slug of the document.
 * @returns The resolved href for the document.
 */
export function resolveHref(
  documentType?: string | null,
  slug?: string,
): string | undefined {
  const allContentTypes = getContentTypes();
  const contentType = allContentTypes.find(
    (contentType) => contentType.name === documentType,
  );
  return contentType?.rewrite
    ? `${addTrailingSlash(contentType.rewrite)}${slug}`
    : undefined;
}
