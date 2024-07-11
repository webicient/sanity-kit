import { visionTool } from "@sanity/vision";
import { definePlugin } from "sanity";
import { structureTool } from "sanity/structure";
import { media } from "sanity-plugin-media";
import { type KitConfig } from "./kitConfig";
import { normalizeCollections, normalizeSingletons } from "./registry/document";
import { singleton } from "./plugins/singleton";
import { structure } from "./plugins/structure";
import { presentationTool } from "sanity/presentation";

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
            typeof location === 'undefined'
              ? 'http://localhost:3000'
              : location.origin,
          draftMode: {
            enable: '/api/draft',
            disable: '/api/disable-draft',
          },
        },
      }),
    ],
    schema: {
      types: [
        ...(config.schema?.types ?? []),
        ...normalizeCollections(
          "contentType",
          config.schema?.contentTypes ?? [],
        ),
        ...normalizeCollections("taxonomy", config.schema?.taxonomies ?? []),
        ...normalizeSingletons(config.schema?.entities ?? []),
      ],
    },
  };
});
