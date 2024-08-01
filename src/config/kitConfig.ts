"server-only";

import once from "lodash/once";
import deepmerge from "deepmerge";
import {
  type Entity,
  type Taxonomy,
  type ContentType,
  type Setting,
  Module,
} from "../types/definition";
import { page, post, preset, redirect } from "./schemas/contentTypes";
import { category } from "./schemas/taxonomies";
import { home } from "./schemas/entities";
import {
  advancedSettings,
  generalSettings,
  integrationSettings,
  scriptsSettings,
  seoSettings,
  socialSettings,
} from "./schemas/settings";
import { defineType } from "sanity";
import { editor, seo } from "./schemas/objects";

interface Schema {
  objects?: ReturnType<typeof defineType>[];
  contentTypes?: ContentType[];
  taxonomies?: Taxonomy[];
  entities?: Entity[];
  settings?: Setting[];
  modules?: Module[];
}

export interface KitConfig {
  schema?: Schema;
  languages?: Record<string, string>;
}

let config: KitConfig | null = null;

export function kitConfig(_config: KitConfig): KitConfig {
  _config?.schema?.modules?.forEach((module) => {
    // Guard config from being named incorrectly.
    if (!module.name.startsWith("module.")) {
      throw new Error(
        `Module name "${module.name}" does not start with "module."`,
      );
    }
  });

  _config?.schema?.contentTypes?.forEach((contentType) => {
    // Guard config from being named incorrectly.
    if (contentType.rewrite && !contentType.rewrite.includes(":slug")) {
      throw new Error(
        `Rewrite path "${contentType.rewrite}" does not include ":slug".`,
      );
    }
  });

  return once(() => {
    config = deepmerge(
      {
        schema: {
          entities: [home],
          contentTypes: [page, post, redirect, preset],
          objects: [seo, editor],
          taxonomies: [category],
          settings: [
            generalSettings,
            socialSettings,
            seoSettings,
            integrationSettings,
            scriptsSettings,
            advancedSettings,
          ],
        },
        languages: {},
      },
      _config,
    );

    return config;
  })();
}

export function getConfig(): KitConfig {
  if (!config) {
    throw new Error("Configuration is not initialized.");
  }

  return config;
}
