import { Metadata } from "next";
import { WithSEOPayload } from "../query";
import { realUrl, resolveHref } from "./url";
import { imageBuilder } from "./image";

/**
 * Retrieves metadata for a document based on its SEO data.
 *
 * @param domain - The domain of the website.
 * @param path - The path of the document.
 * @param document - The document with SEO data.
 * @returns The metadata object containing title, description, openGraph, alternates, and robots settings.
 */
export function getMetadata(
  domain: string,
  path: string,
  document: WithSEOPayload,
): Metadata {
  const { _type, slug, seo } = document;

  // These 3 are required.
  if (!domain || !path || !seo) {
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

  // Canonical URL.
  metadata.alternates = {
    canonical: resolveHref(_type, slug.current)
      ? realUrl(domain, path)
      : document.seo?.advanced?.canonical,
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
