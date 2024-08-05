import { HomeIcon } from "@sanity/icons";
import { defineEntity } from "../registry/define";

export const home = defineEntity({
  name: "home",
  title: "Home",
  icon: HomeIcon,
  supports: ["title", "seo", "modules"],
  rewrite: "/",
  translate: true,
});
