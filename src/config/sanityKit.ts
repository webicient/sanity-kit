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
              console.log('Member',member);
              console.log('fromLanguageId',fromLanguageId);
              console.log('enclosingType',enclosingType);
              // When the document member is named the same as fromLangagueId
              // and it is a field in a object with a name starting with "language"
              // then we return the paths to all other sibling language fields (and their langauge id)
              // It is ok that the member is an object, then all child fields will be translated
              if (
                fromLanguageId === member.name &&
                enclosingType.jsonType === 'object'
              ) {
                return toLanguageIds.map((translateToId) => ({
                  id: translateToId,
                  //changes path.to.en -> path.to.de (for instance)
                  outputPath: [...member.path.slice(0, -1), translateToId],
                }))
              }
              // all other member paths are skipped
              return undefined
            }
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
