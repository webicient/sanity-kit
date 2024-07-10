"server-only";

import once from "lodash/once";
import deepmerge from "deepmerge";
import {
  type Entity,
  type Taxonomy,
  type ContentType,
  type Type,
  type Setting,
} from "../types/definition";
import { seo } from "./schemas/types";
import { page, post } from "./schemas/contentTypes";
import { category } from "./schemas/taxonomies";
import { home } from "./schemas/entities";
import { general } from "./schemas/settings";

interface Schema {
  types?: Type[];
  contentTypes?: ContentType[];
  taxonomies?: Taxonomy[];
  entities?: Entity[];
  settings?: Setting[];
}

export interface KitConfig {
  schema?: Schema;
  languages?: Record<string, string>;
}

let config: KitConfig | null = null;

export function kitConfig(_config: KitConfig): KitConfig {
  return once(() => {
    config = deepmerge(
      {
        schema: {
          types: [seo],
          contentTypes: [page, post],
          taxonomies: [category],
          entities: [home],
          settings: [general],
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
