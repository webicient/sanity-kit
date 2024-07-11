import { TagIcon } from "@sanity/icons";
import { defineTaxonomy } from "../registry/define";

export const category = defineTaxonomy({
  name: "category",
  title: "Category",
  pluralTitle: "Categories",
  icon: TagIcon,
});
