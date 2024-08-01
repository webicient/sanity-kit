import { LinkablePayload } from "../types/globals";
import {
  getContentTypeByName,
  getContentTypes,
  getEntities,
  getEntityByName,
} from "./config";
import { getDocumentHierarchyPath } from "./hierarchy";

/**
 * Adds a leading slash to the given string if it doesn't already have one.
 *
 * @param str - The string to check.
 * @returns The string with a leading slash.
 */
function startWithLeadingSlash(str: string) {
  return str.startsWith("/") ? str : `/${str}`;
}

/**
 * Adds a trailing slash to the given string if it doesn't already have one.
 *
 * @param str - The string to add a trailing slash to.
 * @returns The string with a trailing slash.
 */
function endWithTrailingSlash(str: string) {
  return str.endsWith("/") ? str : str + "/";
}

/**
 * Checks if a URL segment is valid.
 *
 * @param segment - The URL segment to validate.
 * @returns A boolean indicating whether the segment is valid or not.
 */
export function isValidUrlSegment(segment?: string) {
  const pattern = /^(\/?[a-zA-Z0-9\-]+\/?)*$/;
  return segment && pattern.test(segment);
}

/**
 * Checks if a given domain is valid.
 *
 * @param domain - The domain to be checked.
 * @returns A boolean indicating whether the domain is valid or not.
 */
export function isValidDomain(domain?: string) {
  const pattern = /^(?!:\/\/)([a-zA-Z0-9-_]{1,63}\.)+[a-zA-Z]{2,6}$/;
  return domain && pattern.test(domain);
}

/**
 * Returns the real URL by combining the domain and path.
 *
 * @param domain - The domain of the URL.
 * @param path - The path of the URL.
 * @returns The real URL.
 */
export function realUrl(domain?: string, path?: string) {
  if (!domain || !path) {
    return path;
  }

  return `https://${domain}${startWithLeadingSlash(path)}`;
}

/**
 * Transforms a rewrite template by replacing placeholders with corresponding values from the params object.
 * @param template - The rewrite template string.
 * @param params - An object containing key-value pairs for the placeholders in the template.
 * @returns The transformed rewrite string.
 */
function transformRewrite(template: string, params?: Record<string, string>) {
  if (!params) {
    return template;
  }

  return decodeURIComponent(
    template.replace(/:([a-zA-Z0-9_]+)/g, (_: string, key: number) => {
      return params[key] !== undefined ? encodeURIComponent(params[key]) : "";
    }),
  );
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
  params?: Record<string, string>,
): string {
  const rewriteableTypes = [...getContentTypes(), ...getEntities()].filter(
    ({ rewrite }) => Boolean(rewrite),
  );

  const readType = rewriteableTypes.find(
    (readType) => readType.name === documentType,
  );

  return readType?.rewrite
    ? endWithTrailingSlash(transformRewrite(readType.rewrite, params))
    : "";
}

/**
 * Resolves the href for a given document.
 *
 * @param document - The document to resolve the href for.
 * @returns The resolved href.
 */
export function resolveDocumentHref(
  document: LinkablePayload | null | undefined,
): string {
  if (!document) {
    return "";
  }

  if (!document._type) {
    throw new Error(
      "The `_type` field is missing in the document object. Make sure it is included in the query projection from root to its descendants.",
    );
  }

  const fromContentType = getContentTypeByName(document._type);

  if (fromContentType?.rewrite) {
    if (fromContentType.hierarchical) {
      return resolveHref(document._type, {
        slug: getDocumentHierarchyPath(document).join("/"),
      });
    } else {
      return resolveHref(document._type, { slug: document.slug.current });
    }
  }

  const fromEntity = getEntityByName(document._type);

  if (fromEntity?.rewrite) {
    return resolveHref(document._type);
  }

  return "";
}
