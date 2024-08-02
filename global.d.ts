// global.d.ts
import "sanity";

declare module "sanity" {
  export interface StringOptions {
    i18n?: boolean;
  }
  export interface SlugOptions {
    i18n?: boolean;
  }
  export interface DateOptions {
    i18n?: boolean;
  }
  export interface ImageOptions {
    i18n?: boolean;
  }
}
