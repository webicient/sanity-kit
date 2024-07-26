import { DocumentDefinition, type FieldDefinition } from "sanity";
import { CoreFields } from "../kit/defaults/fields";

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
}

export interface Entity extends Singleton {
  menu?: StructureMenu;
  rewrite?: Rewrite;
}

export interface Setting extends Singleton {
  /* No additional properties. */
}
