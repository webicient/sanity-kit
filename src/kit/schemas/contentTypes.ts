import { DocumentIcon, EditIcon } from "@sanity/icons";
import { defineContentType } from "../registry/define";

export const page = defineContentType({
  name: "page",
  title: "Page",
  pluralTitle: "Pages",
  icon: DocumentIcon,
  hierarchical: true,
  rewrite: "/",
});

export const post = defineContentType({
  name: "post",
  title: "Post",
  pluralTitle: "Posts",
  icon: EditIcon,
  taxonomies: [{ name: "category", multiple: true, required: true }],
  supports: ["title", "slug", "excerpt", "body", "seo"],
  rewrite: "/post",
});
