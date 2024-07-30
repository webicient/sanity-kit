import { HomeIcon } from "@sanity/icons";
import { defineField } from "sanity";
import { defineEntity } from "../registry/define";
import { coreGroups } from "../defaults/groups";

export const home = defineEntity({
  name: "home",
  title: "Home",
  icon: HomeIcon,
  groups: coreGroups,
  rewrite: "/",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      group: "content",
      description: "The title of the home page.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
      group: "seo",
    }),
  ],
});
