import { defineModule } from "@webicient/sanity-kit";
import dynamic from "next/dynamic";
import { defineArrayMember, defineField } from "sanity";
import { QUERY } from "./query";

const Component = dynamic(() => import("./Cards"));

export default defineModule({
  name: "module.cards",
  title: "Cards",
  icon: null,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "text",
      title: "Text",
      type: "text",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "cards",
      title: "Cards",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "title",
              title: "Title",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "text",
              title: "Text",
              type: "text",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "link",
              title: "Link",
              type: "kit.link",
            }),
          ],
        }),
      ],
    }),
  ],
  renderer: Component,
  query: QUERY,
  imageUrl: "/modules/module01.png",
});
