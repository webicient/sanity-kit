import { kitConfig } from "@webicient/sanity-kit";
import cards from "@/modules/cards";
import pages from "@/modules/pages";
import service from "@/schema/service";

export default kitConfig({
  schema: {
    modules: [cards, pages],
    contentTypes: [service],
  },
});
