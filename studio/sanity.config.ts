import { defineConfig } from "sanity";
import { sanityKit } from "@webicient/sanity-kit";
import kitConfig from "./kit.config";

export default defineConfig({
  basePath: process.env.SANITY_STUDIO_URL || "/studio",
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "",
  plugins: [sanityKit(kitConfig)],
});
