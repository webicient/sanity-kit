import { DocumentDefinition, type FieldDefinition } from "sanity";
import { CoreFields } from "../config/defaults/fields";
import { ComponentType } from "react";
import { ListItemBuilder, StructureBuilder } from "sanity/structure";

export type Supports = keyof CoreFields;

export type Hierarchical = boolean;

export type PluralTitle = string;

export type Rewrite = string;

export type StructureMenu = {
  level: number;
};

export type ContentTypeTaxonomy = {
  name: string;
  multiple?: boolean;
  required?: boolean;
};

export interface Collection
  extends Omit<DocumentDefinition, "type" | "title" | "fields"> {
  title: string;
  pluralTitle: PluralTitle;
  supports?: Supports[];
  fields?: FieldDefinition[];
  translate?: boolean;
}

export interface ContentType extends Collection {
  rewrite?: Rewrite;
  taxonomies?: ContentTypeTaxonomy[];
  hierarchical?: Hierarchical;
  menu?: StructureMenu;
}

export interface Taxonomy extends Collection {
  /* No additional properties. */
}

export interface Singleton
  extends Omit<DocumentDefinition, "type" | "title" | "fields"> {
  title: string;
  fields?: FieldDefinition[];
  translate?: boolean;
}

export interface Entity extends Singleton {
  menu?: StructureMenu;
  rewrite?: Rewrite;
  supports?: Supports[];
}

export interface Setting extends Singleton {
  /* No additional properties. */
}

export interface Module extends Omit<DocumentDefinition, "type" | "fields"> {
  renderer: ComponentType<any>;
  query?: (language?: string) => string;
  fields?: FieldDefinition[];
  imageUrl: string;
}

export interface Structure {
  menu?: StructureMenu;
  builder?: (S: StructureBuilder) => ListItemBuilder;
}
