import { type KitConfig } from "@webicient/sanity-kit";
import cards from "@/modules/cards";
import pages from "@/modules/pages";
import service from "@/schema/service";
import { customStructure } from "@/schema/structure";

const config: KitConfig = {
  languages: [
    { id: "sv", title: "Swedish", isDefault: true },
    { id: "en", title: "English" },
  ],
  schema: {
    modules: [cards, pages],
    contentTypes: [service],
    structures: [customStructure],
  },
};

export default config;
