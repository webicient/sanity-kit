import { defineModule } from "@webicient/sanity-kit";
import dynamic from "next/dynamic";
import { defineField } from "sanity";

const Component = dynamic(() => import("./Module02"));

export default defineModule({
  name: "module.02",
  title: "Module 02",
  icon: null,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
    }),
  ],
  renderer: Component,
  query: "",
  imageUrl: "/modules/module02.png",
});
