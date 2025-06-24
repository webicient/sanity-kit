"server-only";

import once from "lodash/once";
import deepmerge from "deepmerge";
import {
  type Entity,
  type Taxonomy,
  type ContentType,
  type Setting,
  Module,
  Structure,
} from "../types/definition";
import { page, post, preset, redirect } from "./schemas/contentTypes";
import { category } from "./schemas/taxonomies";
import { home, page404 } from "./schemas/entities";
import {
  advancedSettings,
  generalSettings,
  integrationSettings,
  scriptsSettings,
  seoSettings,
  socialSettings,
} from "./schemas/settings";
import { defineType } from "sanity";
import { kitPreset, seo } from "./schemas/objects";
import { Language } from "@sanity/language-filter";
import { LinkablePayload } from "../types/globals";
import path from "path";
import fs from "fs";

interface Schema {
  objects?: ReturnType<typeof defineType>[];
  contentTypes?: ContentType[];
  taxonomies?: Taxonomy[];
  entities?: Entity[];
  settings?: Setting[];
  modules?: Module[];
  structures?: Structure[];
}

export type CustomProjectionType =
  | "parent"
  | "modules"
  | "supports"
  | "internalLink"
  | "link"
  | "hierarchy"
  | "image"
  | "editor";

interface Custom {
  projection?: (
    type: CustomProjectionType,
    defaultProjection: string,
  ) => string;
}

interface Resolve {
  hrefResolver?: (
    prev: string,
    documentType: string | null | undefined,
    params?: Record<string, any>,
    document?: LinkablePayload | null | undefined,
  ) => string;
  documentHrefResolver?: (
    prev: string,
    document?: LinkablePayload | null | undefined,
    locale?: string,
  ) => string;
  internalLinkQueryFields?: (prev: string, language?: string) => string;
  hierarchyQueryFields?: (
    prev: string,
    language?: string,
    schemaName?: string,
  ) => string;
  richTextQueryFields?: (language?: string) => string;
}

export interface KitConfig {
  schema?: Schema;
  languages?: (Language & { isDefault?: boolean })[];
  custom?: Custom;
  disableDefault?: {
    schema?: { contentTypes?: string[]; taxonomies?: string[] };
  };
  resolve?: Resolve;
  richText?: ReturnType<typeof defineType>[];
}

let config: KitConfig | null = null;

function findSanityKitFile(): string {
  // Look for sanity.kit.ts in common locations
  const possiblePaths = [
    path.join(process.cwd(), "sanity.kit.ts"),
    path.join(process.cwd(), "studio", "sanity.kit.ts"),
    path.join(process.cwd(), "src", "sanity.kit.ts"),
  ];

  for (const filePath of possiblePaths) {
    if (fs.existsSync(filePath)) {
      return filePath;
    }
  }

  throw new Error(
    "Could not find sanity.kit.ts file. Please create one in your project root or studio directory."
  );
}

async function loadSanityKitConfig(): Promise<KitConfig> {
  const sanityKitPath = findSanityKitFile();

  try {
    // Dynamic import to load the configuration
    const module = await import(sanityKitPath);
    const userConfig = module.default || module;

    if (!userConfig || typeof userConfig !== 'object') {
      throw new Error("sanity.kit.ts must export a default configuration object");
    }

    return userConfig as KitConfig;
  } catch (error) {
    throw new Error(`Failed to load sanity.kit.ts: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function kitConfig(): Promise<KitConfig> {
  if (config) {
    return config;
  }

  const userConfig = await loadSanityKitConfig();

  userConfig?.schema?.modules?.forEach((module) => {
    // Guard config from being named incorrectly.
    if (!module.name.startsWith("module.")) {
      throw new Error(
        `Module name "${module.name}" does not start with "module."`,
      );
    }
  });

  userConfig?.schema?.contentTypes?.forEach((contentType) => {
    // Guard config from being named incorrectly.
    if (contentType.rewrite && !contentType.rewrite.includes(":slug")) {
      throw new Error(
        `Rewrite path "${contentType.rewrite}" does not include ":slug".`,
      );
    }
  });

  let defaultContentTypes = [page, post, redirect, preset];

  if (userConfig.disableDefault?.schema?.contentTypes) {
    defaultContentTypes = defaultContentTypes.filter(
      (contentType) =>
        !userConfig.disableDefault?.schema?.contentTypes?.includes(
          contentType.name,
        ),
    );
  }

  let defaultTaxonomies = [category];

  if (userConfig.disableDefault?.schema?.taxonomies) {
    defaultTaxonomies = defaultTaxonomies.filter(
      (taxonomy) =>
        !userConfig.disableDefault?.schema?.taxonomies?.includes(taxonomy.name),
    );
  }

  config = deepmerge(
    {
      schema: {
        entities: [home, page404],
        contentTypes: defaultContentTypes,
        objects: [seo, kitPreset],
        taxonomies: defaultTaxonomies,
        settings: [
          generalSettings,
          socialSettings,
          seoSettings,
          integrationSettings,
          scriptsSettings,
          advancedSettings,
        ],
      },
      languages: [],
      richText: [],
    },
    userConfig,
  );

  return config;
}

export function getConfig(): KitConfig {
  if (!config) {
    throw new Error("Configuration is not initialized. Call kitConfig() first.");
  }

  return config;
}
