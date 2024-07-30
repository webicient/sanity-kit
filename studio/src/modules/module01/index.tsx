import { defineModule } from "@webicient/sanity-kit";
import dynamic from "next/dynamic";
import { defineField } from "sanity";
import module01 from "/public/images/module01.png";

const Component = dynamic(() => import("./Module01"));

export default defineModule({
  name: "module.01",
  title: "Module 01",
  icon: null,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "kit.editor",
      validation: (rule) => rule.required(),
    }),
  ],
  renderer: Component,
  query: "",
  imageUrl: "/modules/module01.png",
});
