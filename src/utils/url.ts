import { getContentTypes } from "./config";

export function resolveHref(
  documentType?: string | null,
  slug?: string,
): string | undefined {
  const allContentTypes = getContentTypes();
  const contentType = allContentTypes.find(
    (contentType) => contentType.name === documentType,
  );
  return contentType?.rewrite ? `${contentType.rewrite}/${slug}` : undefined;
}
