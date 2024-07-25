import { type Metadata } from "next";
import { imageBuilder } from "../utils/image";
import { realUrl, resolveHref } from "../utils/url";
import { SEO } from "../types/seo";
import { Slug } from "sanity";
import { WithHierarchyPayload } from "./loadHierarchy";
import { loadContentType } from "./loadContentType";
import { getContentTypeByName } from "../utils/config";
import { loadSettings } from "./loadSettings";
import { getMetadata } from "../utils/metadata";

export interface WithSEOPayload extends WithHierarchyPayload {
  _id: string;
  _type: string;
  title: string;
  slug: Slug;
  seo: SEO;
}

type LoadMetadataParams = {
  /**
   * Unique name of content type.
   */
  contentType: string;
  /**
   * Accepts slug segments as an array.
   */
  slugs: string[];
};

/**
 * Loads metadata for a given content type and slugs.
 *
 * @param {LoadMetadataParams} params - The parameters for loading metadata.
 * @returns {Promise<Metadata>} - The loaded metadata.
 */
export async function loadMetadata({
  contentType,
  slugs,
}: LoadMetadataParams): Promise<Metadata> {
  const contentTypeObject = getContentTypeByName(contentType);

  if (!contentTypeObject || !contentTypeObject.rewrite) {
    throw new Error(`Content type "${contentTypeObject}" not found.`);
  }

  const { data: document } = await loadContentType<WithSEOPayload>({
    name: contentType,
    slugs,
  });

  if (!document) {
    return {};
  }

  const { _id, _type, seo } = document;

  if (!seo) {
    // Helpful for debugging, or incorrect usage of this function in Vercel.
    console.warn(`Kit: No SEO data found for ${_type} with ID of ${_id}.`);
    return {};
  }

  // Get data from general settings.
  const { data: generalSettings } = await loadSettings({
    name: "generalSettings",
  });

  return getMetadata(
    generalSettings.domain,
    slugs.reverse().join("/"),
    document,
  );
}
