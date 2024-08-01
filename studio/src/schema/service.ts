import { defineContentType } from "@webicient/sanity-kit";
import { BillIcon } from "@sanity/icons";

export default defineContentType({
  name: "service",
  title: "Service",
  pluralTitle: "Services",
  supports: ["title", "slug", "modules"],
  rewrite: "/service/:slug",
  icon: BillIcon,
});
