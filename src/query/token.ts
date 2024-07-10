import "server-only";

import { assertValue } from "../utils/asserts";

/**
 * The read token to use when querying the Sanity API.
 */
export const readToken = assertValue(
  process.env.SANITY_READ_TOKEN,
  "Missing environment variable: SANITY_READ_TOKEN",
);

/**
 * The write token to use when reading and updating data in the Sanity API.
 */
export const writeToken = assertValue(
  process.env.SANITY_WRITE_TOKEN,
  "Missing environment variable: SANITY_WRITE_TOKEN",
);
