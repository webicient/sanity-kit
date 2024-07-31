import { Metadata } from "next";
import { realUrl, resolveHref } from "./url";
import { imageBuilder } from "./image";
import { headers } from "next/headers";
import { getContentTypes, getEntities } from "./config";
import { SEOPayload } from "../types";

/**
 * Retrieves the metadata for a document.
 *
 * @param document - The document object.
 * @param replaceData - Optional. A record of key-value pairs used to replace data in the URL.
 * @param siteDomain - Optional. The domain of the site.
 * @returns The metadata object.
 * @throws Error if the document is null, or if the document does not have a type or the type's rewrite URL is empty.
 */
export function getMetadata(
  document: SEOPayload | null,
  replaceData?: Record<string, string>,
  siteDomain?: string,
): Metadata {
  // In case a document was not passed.
  if (!document) {
    return {};
  }

  // If the document does not have a type.
  if (!document?._type) {
    throw new Error(
      `Kit: The \`_type\` field is missing in the document object. Maybe query projection is missing the \`_type\` field.`,
    );
  }

  const typeObject = [...getContentTypes(), ...getEntities()].find(
    (type) => type.name === document?._type,
  );

  if (!typeObject || !typeObject.rewrite) {
    throw new Error(
      `Kit: Document with name "${typeObject}" not found or its rewrite URL is empty.`,
    );
  }

  const { _type, seo } = document;

  // In case a document was passed without SEO data.
  if (!seo) {
    return {};
  }

  const metadata: Metadata = {};

  // Grab the image URL from the SEO data.
  const imageUrl = seo?.openGraph?.image
    ? imageBuilder
        ?.image(seo?.openGraph?.image)
        .width(1200)
        .height(630)
        .fit("crop")
        .url()
    : null;

  // If the document has SEO data, use it. Otherwise, use the document title.
  metadata.title = seo?.title || document.title;

  // Get the description from the SEO data.
  metadata.description = seo?.description;

  // OpenGraph data.
  metadata.openGraph = {
    title: seo?.openGraph?.title || metadata.title,
    description: seo?.openGraph?.description || metadata.description,
    images: imageUrl
      ? [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: seo?.openGraph?.title || metadata.title,
          },
        ]
      : undefined,
  };

  const domain = siteDomain || headers().get("host") || "";

  // Canonical URL.
  metadata.alternates = {
    canonical: document.seo?.advanced?.canonical
      ? document.seo?.advanced?.canonical
      : realUrl(domain, resolveHref(_type, replaceData)),
  };

  // Robots settings.
  metadata.robots = {
    index: document.seo?.advanced?.robots?.index !== false,
    follow: document.seo?.advanced?.robots?.follow !== false,
    noarchive: document.seo?.advanced?.robots?.archive === false,
    noimageindex: document.seo?.advanced?.robots?.imageIndex === false,
    nosnippet: document.seo?.advanced?.robots?.snippet === false,
  };

  return metadata;
}
