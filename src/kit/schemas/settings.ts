import { CogIcon } from "@sanity/icons";
import { defineField } from "sanity";
import { defineEntity } from "../define";

export const general = defineEntity({
  name: "general",
  title: "General",
  icon: CogIcon,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description:
        "Enter the title of your site. A well-crafted title enhances SEO by clearly reflecting the nature and focus of your site.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      description:
        "Provide a concise and compelling meta description for your site. This text is crucial for SEO, as it appears in search engine results and gives potential visitors a snapshot of your site's content.",
      validation: (rule) => rule.required(),
    }),
  ],
});
