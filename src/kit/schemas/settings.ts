import {
  CodeBlockIcon,
  CogIcon,
  EyeOpenIcon,
  JoystickIcon,
  PackageIcon,
  SearchIcon,
} from "@sanity/icons";
import { defineField } from "sanity";
import { defineSetting } from "../registry/define";
import { isValidDomain } from "../../utils/url";

export const generalSettings = defineSetting({
  name: "generalSettings",
  title: "General",
  icon: CogIcon,
  fields: [
    defineField({
      name: "siteTitle",
      title: "Site Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "domain",
      title: "Domain",
      type: "string",
      validation: (rule) =>
        rule.custom((value?: string) => {
          return isValidDomain(value) ? true : "Invalid domain";
        }),
    }),
    defineField({
      name: "searchEngineVisibility",
      title: "Search Engine Visibility",
      type: "boolean",
      description: "Discourage search engines from indexing this site.",
    }),
  ],
});

export const socialSettings = defineSetting({
  name: "socialMediaSettings",
  title: "Social Media",
  icon: EyeOpenIcon,
  fields: [
    defineField({
      name: "facebook",
      title: "Facebook",
      type: "url",
    }),
    defineField({
      name: "twitter",
      title: "Twitter",
      type: "url",
    }),
    defineField({
      name: "instagram",
      title: "Instagram",
      type: "url",
    }),
    defineField({
      name: "linkedin",
      title: "LinkedIn",
      type: "url",
    }),
    defineField({
      name: "youtube",
      title: "YouTube",
      type: "url",
    }),
  ],
});

export const seoSettings = defineSetting({
  name: "seoSettings",
  title: "SEO",
  icon: SearchIcon,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
    }),
  ],
});

export const integrationSettings = defineSetting({
  name: "integrationSettings",
  title: "Integrations",
  icon: PackageIcon,
  fields: [
    defineField({
      name: "gtmId",
      title: "Google Tag Manager ID",
      type: "string",
      description:
        "The tag manager ID for Google Tag Manager. You can find this in the GTM interface. Formatted as `GTM-XXXXXX",
    }),
  ],
});

export const scriptsSettings = defineSetting({
  name: "scriptsSettings",
  title: "Scripts",
  icon: CodeBlockIcon,
  fields: [
    defineField({
      name: "head",
      title: "Head",
      type: "text",
      description: "Scripts to include in the head of the document.",
    }),
    defineField({
      name: "preBody",
      title: "Pre Body",
      type: "text",
      description: "Scripts to include at the beginning of the body.",
    }),
    defineField({
      name: "postBody",
      title: "Post Body",
      type: "text",
      description: "Scripts to include at the end of the body.",
    }),
  ],
});

export const advancedSettings = defineSetting({
  name: "advancedSettings",
  title: "Advanced",
  icon: JoystickIcon,
  fields: [
    defineField({
      name: "robots",
      title: "Robots",
      type: "text",
      description: "The custom robots.txt of the website.",
    }),
  ],
});
