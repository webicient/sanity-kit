import { kitConfig } from "@webicient/sanity-kit";
import cards from "@/modules/cards";
import pages from "@/modules/pages";
import service from "@/schema/service";
import { defineType } from "sanity";
import { customStructure } from "@/schema/structure";

export default kitConfig({
  languages: [
    { id: "sv", title: "Swedish", isDefault: true },
    { id: "en", title: "English" },
  ],
  schema: {
    modules: [cards, pages],
    contentTypes: [service],
    structures: [customStructure],
  },
});
