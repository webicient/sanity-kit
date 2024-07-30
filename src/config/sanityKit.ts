import { visionTool } from "@sanity/vision";
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
