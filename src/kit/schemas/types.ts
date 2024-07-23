import { defineField, defineType } from "sanity";
import { REDIRECT_OPTIONS } from "../defaults/constants";

export const seo = defineType({
  name: "seo",
  type: "object",
  options: {
    collapsible: true,
    collapsed: false,
  },
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "Around 55-60 characters long.",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      description: "Around 150-160 characters long. Limit to 300 characters.",
    }),
    defineField({
      name: "openGraph",
      title: "OpenGraph",
      type: "object",
      description: "OpenGraph meta tags for social media sharing.",
      options: {
        collapsible: true,
        collapsed: true,
      },
      fields: [
        defineField({
          name: "title",
          title: "Title",
          type: "string",
          description: "Around 55-60 characters long.",
        }),
        defineField({
          name: "description",
          title: "Description",
          type: "text",
          description:
            "Around 150-160 characters long. Limit to 300 characters.",
        }),
        defineField({
          name: "image",
          title: "Image",
          type: "image",
          description: "Minimum 1200 x 630 pixels, 1.91:1 ratio.",
        }),
      ],
    }),
    defineField({
      name: "advanced",
      title: "Advanced",
      type: "object",
      description: "Advanced SEO settings.",
      options: {
        collapsible: true,
        collapsed: true,
      },
      fields: [
        defineField({
          name: "canonical",
          title: "Canonical URL",
          type: "url",
          description:
            "The canonical URL informs search crawlers which page is the main page if you have double content.",
        }),
        defineField({
          name: "redirect",
          title: "Redirect",
          type: "object",
          options: {
            collapsible: false,
          },
          fields: [
            defineField({
              name: "enabled",
              title: "Enabled",
              type: "boolean",
              initialValue: false,
            }),
            defineField({
              name: "type",
              title: "Type",
              type: "string",
              initialValue: "301",
              options: {
                list: REDIRECT_OPTIONS,
                layout: "radio",
              },
              hidden: ({ parent = {} }) => {
                const { enabled = false } = parent as Record<string, unknown>;
                return !enabled;
              },
            }),
            defineField({
              name: "url",
              title: "Destination URL",
              type: "url",
              hidden: ({ parent = {} }) => {
                const { enabled = false } = parent as Record<string, unknown>;
                return !enabled;
              },
            }),
          ],
        }),
        defineField({
          name: "robots",
          title: "Robots Meta",
          type: "object",
          options: {
            columns: 2,
          },
          fields: [
            defineField({
              name: "index",
              title: "Index",
              type: "boolean",
              initialValue: true,
              description:
                "Instructs search engines to index and show these pages in the search results.",
            }),
            defineField({
              name: "follow",
              title: "Follow",
              type: "boolean",
              initialValue: true,
              description:
                "Instructs search engines to follow the links on the page.",
            }),
            defineField({
              name: "archive",
              title: "Archive",
              type: "boolean",
              initialValue: true,
              description:
                "Instructs search engines to show a cached version of the page.",
            }),
            defineField({
              name: "imageIndex",
              title: "Image Index",
              type: "boolean",
              initialValue: true,
              description:
                "Instructs search engines to index images on the page.",
            }),
            defineField({
              name: "snippet",
              title: "Snippet",
              type: "boolean",
              initialValue: true,
              description:
                "Instructs search engines to show a snippet of the page.",
            }),
          ],
        }),
      ],
    }),
  ],
});
