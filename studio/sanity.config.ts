import { defineConfig } from "sanity";
import { sanityKit } from "@webicient/sanity-kit";
import { studioUrl, projectId, dataset } from "@/sanity/env";
import kitConfig from "./kit.config";

export default defineConfig({
  basePath: studioUrl,
  projectId,
  dataset,
  plugins: [sanityKit(kitConfig)],
});
