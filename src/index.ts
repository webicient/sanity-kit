// Config exports
export {
  kitConfig,
  getConfig,
  type KitConfig,
  type CustomProjectionType,
} from "./config/kitConfig";

export { sanityKit } from "./config/sanityKit";

// Registry exports
export {
  defineEntity,
  defineSetting,
  defineContentType,
  defineTaxonomy,
  defineModule,
  defineStructure,
} from "./config/registry/define";

// Defaults exports
export {
  TITLE_FIELD,
  SLUG_FIELD,
  EXCERPT_FIELD,
  BODY_FIELD,
  PUBLISHED_AT_FIELD,
  IMAGE_FIELD,
  SEO_FIELD,
  MODULES_FIELD,
  LINK_FIELD,
  CORE_FIELDS,
  type CoreFields,
} from "./config/defaults/fields";

// Types exports
export {
  type Supports,
  type Hierarchical,
  type PluralTitle,
  type Rewrite,
  type StructureMenu,
  type ContentTypeTaxonomy,
  type Collection,
  type ContentType,
  type Taxonomy,
  type Singleton,
  type Entity,
  type Setting,
  type Module,
  type Structure,
} from "./types/definition";

export {
  type SEO,
} from "./types/seo";

export {
  type ValidCollectionType,
  type ValidSingletonType,
} from "./types/validity";

export {
  type BasePayload,
  type TitlePayload,
  type SlugPayload,
  type PublishedAtPayload,
  type FeaturedImagePayload,
  type ExcerptPayload,
  type HierarchyPayload,
  type SEOPayload,
  type BodyPayload,
  type ModulesPayload,
  type TranslationPayload,
  type ContentTypePayload,
  type EntityPayload,
} from "./types/payload";

export {
  type InternalLinkPayload,
  type LinkPayload,
  type ImagePayload,
  type RichTextPayload,
} from "./types/object";
