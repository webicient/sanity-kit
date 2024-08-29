import { PortableTextBlock, Slug } from "sanity";
import { SEO } from "./seo";
import { ImagePayload } from "./object";

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
  featuredImage?: ImagePayload;
}

export interface ExcerptPayload {
  excerpt?: string;
}

export interface HierarchyPayload {
  _id: string;
  _type: string;
  title: string;
  slug: Slug | Record<string, Slug>;
  parent: HierarchyPayload | null;
}

export interface SEOPayload extends BasePayload, TitlePayload, ExcerptPayload {
  seo?: SEO;
}

export interface BodyPayload {
  body?: PortableTextBlock[];
}

export interface ModulesPayload {
  modules?: any[];
}

export interface TranslationPayload {
  _translation?: HierarchyPayload;
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
    SEOPayload,
    TranslationPayload {
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
    SEOPayload,
    TranslationPayload {}
