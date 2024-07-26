import { type Metadata } from "next";
import { SEO } from "../../types/seo";
import { Slug } from "sanity";
import { WithHierarchyPayload } from "./loadHierarchy";
import { loadContentType } from "../structure/loadContentType";
import { getContentTypeByName, getEntityByName } from "../../utils/config";
import { loadSettings } from "../structure/loadSettings";
import { getMetadata } from "../../utils/metadata";
import { loadEntity } from "../structure/loadEntity";

export interface WithSEOPayload extends WithHierarchyPayload {
  _id: string;
  _type: string;
  title: string;
  slug: Slug;
  seo: SEO;
}

type LoadMetadataParamsBase = {
  /**
   * Unique name of content type.
   */
  name: string;
};

type ContentTypeParams = LoadMetadataParamsBase & {
  type: "contentType";
  /**
   * Accepts slug segments as an array.
   */
  slugs: string[];
};

type EntityParams = LoadMetadataParamsBase & {
  type: "entity";
  /**
   * Accepts slug segments as an array.
   */
  slugs?: string[];
};

type LoadMetadataParams = ContentTypeParams | EntityParams;

/**
 * Loads metadata for a given content type and slugs.
 *
 * @param {LoadMetadataParams} params - The parameters for loading metadata.
 * @returns {Promise<Metadata>} - The loaded metadata.
 */
export async function loadMetadata({
  type,
  name,
  slugs,
}: LoadMetadataParams): Promise<Metadata> {
  let req = null;
  let path = "";

  const typeObject =
    type === "contentType" ? getContentTypeByName(name) : getEntityByName(name);

  if (!typeObject || !typeObject.rewrite) {
    throw new Error(
      `Content type "${typeObject}" not found or its rewrite URL not found.`,
    );
  }

  if (type === "contentType") {
    req = await loadContentType<WithSEOPayload>({
      name,
      slugs,
    });
    path = slugs.reverse().join("/");
  } else {
    req = await loadEntity<WithSEOPayload>({
      name: name,
    });
    path = typeObject.rewrite;
  }

  if (!req.data) {
    return {};
  }

  const { _id, _type, seo } = req.data;

  if (!seo) {
    // Helpful for debugging, or incorrect usage of this function in Vercel.
    console.warn(`Kit: No SEO data found for ${_type} with ID of ${_id}.`);
    return {};
  }

  // Get data from general settings.
  const { data: generalSettings } = await loadSettings({
    name: "generalSettings",
  });

  return getMetadata(generalSettings.domain, path, req.data);
}
