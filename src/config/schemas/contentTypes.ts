import { DocumentIcon, EditIcon, LinkIcon, StackIcon } from "@sanity/icons";
import { defineContentType } from "../registry/define";
import { defineField } from "sanity";
import { REDIRECT_OPTIONS } from "../defaults/constants";
import { isValidUrlSegment } from "../../utils/url";

export const page = defineContentType({
  name: "page",
  title: "Page",
  pluralTitle: "Pages",
  icon: DocumentIcon,
  hierarchical: true,
  supports: ["title", "slug", "seo", "modules"],
  rewrite: "/:slug",
});

export const post = defineContentType({
  name: "post",
  title: "Post",
  pluralTitle: "Posts",
  icon: EditIcon,
  taxonomies: [{ name: "category", multiple: true, required: true }],
  supports: ["title", "slug", "excerpt", "body", "seo"],
  rewrite: "/post/:slug",
});

export const redirect = defineContentType({
  name: "redirect",
  title: "Redirect",
  pluralTitle: "Redirects",
  icon: LinkIcon,
  supports: [],
  groups: [],
  menu: {
    level: 4,
  },
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      description: "A clear name to help easily identify and manage redirects.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "source",
      title: "Source",
      type: "string",
      description:
        "URLs without including the host (https://example.com/). Examples are: '/old-page' or '/news/old-article'.",
      validation: (rule) =>
        rule.required().custom((segment?: string) => {
          // TODO: i18n
          return !isValidUrlSegment(segment)
            ? "Source must be a valid path segment."
            : true;
        }),
    }),
    defineField({
      name: "destination",
      title: "Destination",
      type: "url",
      description:
        "URL including the host. Examples are: 'https://example.com/new-page', or 'https://example.com/news/new-article'.",
      validation: (rule) => rule.required(),
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
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      name: "name",
      source: "source",
      destination: "destination",
    },
    prepare({ name, source, destination }) {
      return {
        title: name,
        subtitle: `${source} → ${destination}`,
      };
    },
  },
});

export const preset = defineContentType({
  name: "preset",
  title: "Preset",
  pluralTitle: "Presets",
  icon: StackIcon,
  supports: [],
  groups: [],
  menu: {
    level: 4,
  },
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
  ],
});
