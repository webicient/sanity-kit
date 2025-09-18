import { DocumentIcon, EditIcon, LinkIcon, StackIcon } from "@sanity/icons";
import { defineContentType } from "../registry/define";
import { defineField } from "sanity";
import { REDIRECT_OPTIONS } from "../defaults/constants";
import { isValidUrlSegment } from "../../utils/url";
import { MODULES_FIELD } from "../defaults/fields";

export const page = defineContentType({
  name: "page",
  title: "Page",
  pluralTitle: "Pages",
  icon: DocumentIcon,
  hierarchical: true,
  supports: ["title", "slug", "seo", "modules"],
  rewrite: "/:slug",
  translate: true,
});

export const post = defineContentType({
  name: "post",
  title: "Post",
  pluralTitle: "Posts",
  icon: EditIcon,
  taxonomies: [{ name: "category", multiple: true, required: true }],
  supports: [
    "title",
    "slug",
    "publishedAt",
    "featuredImage",
    "excerpt",
    "body",
    "seo",
  ],
  rewrite: "/post/:slug",
  translate: true,
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
        rule.required().custom(async (source, context) => {
          if (!source) {
            return true;
          }

          // Check that source starts with a forward slash
          if (!source.startsWith("/")) {
            return "Source path must start with a forward slash (/)";
          }

          // Find all redirect documents with the same source path
          // But exclude the current document being edited
          const { document, getClient } = context;

          const docId = document?._id.split(".").pop() ?? null;
          if (docId === null) {
            return true;
          }

          // Query for documents of type 'redirect' with the same source
          const query = `*[_type == "redirect" && source == $source && (_id != $docId && _id != $draftId)][0]`;
          const params = { source, docId, draftId: document?._id };
          const existingDoc = await getClient({
            apiVersion: "2023-01-01",
          }).fetch(query, params);

          // If we found a document with the same source, return an error
          return existingDoc
            ? "This redirect source path is already in use. Source paths must be unique."
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
        title: source,
        subtitle: destination,
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
      name: "name",
      title: "Name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "uniqueId",
      title: "Unique ID",
      type: "slug",
      validation: (rule) => rule.required(),
      options: {
        source: "name",
      },
    }),
    MODULES_FIELD,
    defineField({
      name: "image",
      title: "Preview Image",
      type: "image",
    }),
  ],
});
