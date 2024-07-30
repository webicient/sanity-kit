import "server-only";

import { assertValue } from "../utils/asserts";

/**
 * API version to use when querying the Sanity API.
 */
export const apiVersion = process.env.SANITY_API_VERSION ?? "2023-10-06";

/**
 * The dataset to use when querying the Sanity API.
 */
export const dataset = assertValue(
  process.env.NEXT_PUBLIC_SANITY_DATASET,
  "Missing environment variable: NEXT_PUBLIC_SANITY_DATASET",
);

/**
 * The project ID to use when querying the Sanity API.
 */
export const projectId = assertValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  "Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID",
);

/**
 * The URL to use when previewing content in the Sanity Studio.
 */
export const previewUrl =
  process.env.SANITY_STUDIO_PREVIEW_URL ?? "http://localhost:3000";

/**
 * The URL to use when accessing the Sanity Studio.
 */
export const studioUrl = process.env.SANITY_STUDIO_URL ?? "/studio";

/**
 * The secret to use when revalidating the cache.
 */
export const revalidateSecret = process.env.SANITY_REVALIDATE_SECRET;

/**
 * Whether to use the CDN when querying the Sanity API.
 */
export const useCdn = process.env.SANITY_USE_CDN === "true";
