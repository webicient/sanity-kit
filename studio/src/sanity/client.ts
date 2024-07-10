import { createClient } from "@sanity/client";
import { apiVersion, dataset, projectId, studioUrl, useCdn } from "./env";

export const client = createClient({
  apiVersion,
  dataset,
  projectId,
  useCdn,
  perspective: "published",
  stega: {
    enabled: false,
    studioUrl,
  },
});
