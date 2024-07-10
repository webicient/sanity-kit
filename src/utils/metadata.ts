import { type Metadata } from "next";
import { groq } from "next-sanity";
import { client } from "../query/client";
import { getContentTypes } from "./config";
import { imageBuilder } from "./image";
import { resolveHref } from "./url";
import merge from "lodash/merge";
import { SEO } from "../types/seo";

export interface MetadataParams {
  params: {
    segments: string[];
  };
}

export interface MetadataPayload {
  title: string;
  seo: SEO;
}

const QUERY = groq`
  *[_type == $type && slug.current == $slug][0]{
    title,
    seo
  }
`;

const getContentTypeNameBySegment = (segment: string): string | undefined => {
  // Special case for the root path.
  if (segment === "/") {
    return "page";
  }

  return getContentTypes()
    .filter(({ name }) => name !== "page")
    .find(({ rewrite }) => {
      return rewrite.startsWith(segment);
    })?.name;
};

export async function getMetadata() {}

export async function metadata(
  { params }: MetadataParams,
  override?: Metadata,
): Promise<Metadata> {
  const segments = [...params.segments];
  const slug = segments.pop();
  const contentType = getContentTypeNameBySegment(`/${segments.join("/")}`);

  const data = await client.fetch<MetadataPayload>(
    QUERY,
    { slug: slug, type: contentType },
    { next: { tags: [`${contentType}:${slug}`] } },
  );

  if (!data) {
    return {};
  }

  const { seo } = data;

  if (!seo) {
    // Helpful for debugging, or incorrect usage of this function in Vercel.
    console.log(`No SEO data found for ${contentType}:${slug}.`);
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
  metadata.title = seo?.title || data.title;
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
    canonical: data.seo?.advanced?.canonical || resolveHref(contentType, slug),
  };
  // Robots settings.
  metadata.robots = {
    index: data.seo?.advanced?.robots?.index !== false,
    follow: data.seo?.advanced?.robots?.follow !== false,
    noarchive: data.seo?.advanced?.robots?.archive === false,
    noimageindex: data.seo?.advanced?.robots?.imageIndex === false,
    nosnippet: data.seo?.advanced?.robots?.snippet === false,
  };

  return merge(metadata, override);
}
