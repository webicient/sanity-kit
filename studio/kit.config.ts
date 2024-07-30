import { kitConfig } from "@webicient/sanity-kit";
import module01 from "@/modules/module01";
import module02 from "@/modules/module02";

export default kitConfig({
  schema: {
    modules: [module01, module02],
  },
});
