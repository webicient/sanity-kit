import { DocumentIcon, EditIcon } from "@sanity/icons";
import { defineContentType } from "../define";

export const page = defineContentType({
  name: "page",
  title: "Page",
  pluralTitle: "Pages",
  icon: DocumentIcon,
  rewrite: "/",
});

export const post = defineContentType({
  name: "post",
  title: "Post",
  pluralTitle: "Posts",
  icon: EditIcon,
  taxonomies: ["category"],
  supports: ["title", "slug", "excerpt", "body", "seo"],
  rewrite: "/post",
});
