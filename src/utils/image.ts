import createImageUrlBuilder from "@sanity/image-url";
import { dataset, projectId } from "../query/env";

export const imageBuilder = createImageUrlBuilder({
  projectId: projectId,
  dataset: dataset,
});
