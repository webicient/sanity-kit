import { createClient } from "@sanity/client";
import {
  apiVersion,
  dataset,
  projectId,
  studioUrl,
  useCdn,
} from "../env/env";
import { readToken } from "../env/token";

/**
 * The Sanity client that allows us to fetch data from the Sanity API. This client
 * only uses read tokens, so it can only be used to fetch data from the API.
 *
 * @see https://www.sanity.io/docs/client-libraries/js-client
 */
export const client = createClient({
  token: readToken,
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
