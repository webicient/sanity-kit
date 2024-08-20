import { AccessDeniedIcon, HomeIcon } from "@sanity/icons";
import { defineEntity } from "../registry/define";

export const home = defineEntity({
  name: "home",
  title: "Home",
  icon: HomeIcon,
  supports: ["title", "seo", "modules"],
  rewrite: "/",
  translate: true,
});

export const page404 = defineEntity({
  name: "page.404",
  title: "404",
  icon: AccessDeniedIcon,
  supports: ["title", "seo", "modules"],
  rewrite: "/404",
  translate: true,
  menu: { level: 4 },
});
