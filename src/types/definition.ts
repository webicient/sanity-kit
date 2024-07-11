import { type ComponentType, type ReactNode } from "react";
import { type FieldDefinition, type FieldGroupDefinition } from "sanity";
import { type CollectionSupports } from "./core";

/**
 * Almost a replica of the `DocumentDefinition` type from the `sanity` package.
 */
export interface Document {
  name: string;
  title: string;
  icon?: ComponentType | ReactNode;
  groups?: FieldGroupDefinition[];
  fields?: FieldDefinition[];
}

export interface Collection extends Document {
  pluralTitle: string;
  hierarchical?: boolean;
  supports?: CollectionSupports[];
}

export type TaxonomySetting = {
  name: string;
  multiple?: boolean;
  required?: boolean;
};

export interface ContentType extends Collection {
  taxonomies?: TaxonomySetting[];
  rewrite?: string;
}

/* Non-interfaced types yet.  */
export type Singleton = Document;
export type Taxonomy = Collection;
export type Entity = Singleton;
export type Setting = Singleton;
export type Type = FieldDefinition;
