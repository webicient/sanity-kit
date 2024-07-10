import "server-only";

import { createClient } from "@sanity/client";
import { apiVersion, dataset, projectId, studioUrl, useCdn } from "./env";
import { writeToken } from "./token";

/**
 * The Sanity client that allows to read and update data in the Sanity API. This client
 * uses a write token, so it can be used to update data in the API.
 *
 * @see https://www.sanity.io/docs/client-libraries/js-client
 */
export const serverClient = createClient({
  token: writeToken,
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
