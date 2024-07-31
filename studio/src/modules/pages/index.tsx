import { defineModule } from "@webicient/sanity-kit";
import dynamic from "next/dynamic";
import { defineField } from "sanity";
import { QUERY } from "./query";

const Component = dynamic(() => import("./Pages"));

export default defineModule({
  name: "module.pages",
  title: "Pages",
  icon: null,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
    }),
    defineField({
      name: "text",
      title: "Text",
      type: "kit.editor",
    }),
  ],
  renderer: Component,
  query: QUERY,
  imageUrl: "/modules/module02.png",
});
