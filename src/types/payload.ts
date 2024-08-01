import { Image, PortableTextBlock, Slug } from "sanity";
import { SEO } from "./seo";

export interface BasePayload {
  _id: string;
  _type: string;
}

export interface TitlePayload {
  title?: string;
}

export interface SlugPayload {
  slug: Slug;
}

export interface PublishedAtPayload {
  publishedAt?: string;
}

export interface FeaturedImagePayload {
  featuredImage?: Image;
}

export interface ExcerptPayload {
  excerpt?: string;
}

export interface HierarchyPayload {
  _id: string;
  _type: string;
  title: string;
  slug: Slug;
  parent: HierarchyPayload | null;
}

export interface SEOPayload extends BasePayload, TitlePayload {
  seo?: SEO;
}

export interface BodyPayload {
  body?: PortableTextBlock[];
}

export interface ModulesPayload {
  modules?: any[];
}

export interface ContentTypePayload
  extends BasePayload,
    TitlePayload,
    SlugPayload,
    PublishedAtPayload,
    FeaturedImagePayload,
    ExcerptPayload,
    BodyPayload,
    ModulesPayload,
    SEOPayload {
  parent?: HierarchyPayload;
}

export interface EntityPayload
  extends BasePayload,
    TitlePayload,
    SlugPayload,
    PublishedAtPayload,
    FeaturedImagePayload,
    ExcerptPayload,
    BodyPayload,
    ModulesPayload,
    SEOPayload {}
