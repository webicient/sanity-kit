import { visionTool } from "@sanity/vision";
import { assist } from '@sanity/assist'
import { definePlugin } from "sanity";
import { structureTool } from "sanity/structure";
import { media } from "sanity-plugin-media";
import { type KitConfig } from "./kitConfig";
import {
  normalizeCollections,
  normalizeModules,
  normalizeSingletons,
} from "./registry/document";
import { singleton } from "./plugins/singleton";
import { structure } from "./plugins/structure";
import { productionUrl } from "./plugins/productionUrl";
import { presentationTool } from "sanity/presentation";
import { template } from "./plugins/template";
import { getObjectsWithConfigRequired } from "./schemas/objects";
import { Language, languageFilter } from "@sanity/language-filter";

/**
 * Usage in `sanity.config.ts` (or .js)
 *
 * ```ts
 * import { defineConfig } from 'sanity';
 * import { sanityKit } from '@webicient/sanity-kit';
 *
 * export default defineConfig({
 *   plugins: [sanityKit()],
 * })
 * ```
 */
export const sanityKit = definePlugin<KitConfig>((config: KitConfig) => {
  return {
    name: "@webicient/sanity-kit",
    plugins: [
      assist({
        translate: {
          field: {
            languages: config?.languages as Language[],
            documentTypes: [
              ...(config.schema?.contentTypes
                ?.filter(({ translate }) => translate)
                .map(({ name }) => name) || []),
              ...(config.schema?.entities
                ?.filter(({ translate }) => translate)
                .map(({ name }) => name) || []),
              ...(config.schema?.taxonomies
                ?.filter(({ translate }) => translate)
                .map(({ name }) => name) || []),
              ...(config.schema?.settings
                ?.filter(({ translate }) => translate)
                .map(({ name }) => name) || []),
            ],
            translationOutputs: (member, enclosingType, fromLanguageId, toLanguageIds) => {
      
              // Ensure fields like 'slug', 'featuredImage', 'publishedAt' are skipped
              if (['slug', 'publishedAt', 'featuredImage'].some((skipField) => member.path.includes(skipField))) {
                return undefined;
              }
      
              // Recursively check if we are inside an array or an object to translate fields like 'cards'
              const shouldTranslate = (type:any) => ['object','array'].includes(type);
      
              // If the member matches the fromLanguageId, and is an object or array type, proceed with translation
              if (fromLanguageId === member.name && shouldTranslate(enclosingType.jsonType)) {
                return toLanguageIds.map((translateToId) => ({
                  id: translateToId,
                  // Change path.to.en -> path.to.sv (or other target languages)
                  outputPath: [...member.path.slice(0, -1), translateToId],
                }));
              }
            
              // Skip all other fields
              return undefined;
            },
          },
        },
      }),
      structureTool({
        structure: structure(),
      }),
      visionTool(),
      media(),
      singleton(),
      presentationTool({
        previewUrl: {
          origin:
            typeof location === "undefined"
              ? "http://localhost:3000"
              : location.origin,
          draftMode: {
            enable: "/api/draft/enable",
            disable: "/api/draft/disable",
          },
        },
      }),
      Boolean(config.languages?.length) &&
        languageFilter({
          supportedLanguages: config.languages as Language[],
          defaultLanguages: config?.languages
            ? [config?.languages?.[0]?.id]
            : undefined,
          documentTypes: [
            ...(config.schema?.contentTypes
              ?.filter(({ translate }) => translate)
              .map(({ name }) => name) || []),
            ...(config.schema?.entities
              ?.filter(({ translate }) => translate)
              .map(({ name }) => name) || []),
            ...(config.schema?.taxonomies
              ?.filter(({ translate }) => translate)
              .map(({ name }) => name) || []),
            ...(config.schema?.settings
              ?.filter(({ translate }) => translate)
              .map(({ name }) => name) || []),
          ],
          filterField: (enclosingType, field, selectedLanguageIds) => {
            return !(
              config.languages?.map(({ id }) => id).includes(field.name) &&
              !selectedLanguageIds.includes(field.name)
            );
          },
        }),
    ],
    schema: {
      types: [
        ...getObjectsWithConfigRequired(),
        ...normalizeModules(config.schema?.modules ?? []),
        ...(config.schema?.objects ?? []),
        ...normalizeCollections(
          "contentType",
          config.schema?.contentTypes ?? [],
        ),
        ...normalizeCollections("taxonomy", config.schema?.taxonomies ?? []),
        ...normalizeSingletons("entity", config.schema?.entities ?? []),
        ...normalizeSingletons("setting", config.schema?.settings ?? []),
      ],
      templates: template(),
    },
    document: {
      productionUrl,
    },
  };
});
