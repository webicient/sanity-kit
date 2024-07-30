import "server-only";

import { serverClient } from "./serverClient";
import { draftMode } from "next/headers";
import * as queryStore from "@sanity/react-loader";

const loadQueryClient = serverClient.withConfig({
  stega: {
    // Enable stega if it's a Vercel preview deployment, as the Vercel Toolbar has controls that shows overlays
    enabled: process.env.VERCEL_ENV === "preview",
  },
});

/**
 * Sets the server client for the query store, doing it here ensures that all data fetching in production
 * happens on the server and not on the client.
 * Live mode in `sanity/presentation` still works, as it uses the `useLiveMode` hook to update `useQuery` instances with
 * live draft content using `postMessage`.
 */
queryStore.setServerClient(loadQueryClient);

const usingCdn = loadQueryClient.config().useCdn;

/**
 * Loads a query using the query store, with the appropriate perspective based on whether draft mode is enabled.
 * If `next.tags` is set, and we're not using the CDN, then it's safe to cache.
 * If we're using the CDN, we can cache for 60 seconds.
 *
 * @param query - The query to load
 * @param params - The parameters for the query
 * @param options - The options for the query
 * @returns The result of the query
 */
export const loadQuery = ((query, params = {}, options = {}) => {
  const {
    perspective = draftMode().isEnabled ? "previewDrafts" : "published",
  } = options;

  // Don't cache by default.
  let revalidate: number | false | undefined = 0;

  // If `next.tags` is set, and we're not using the CDN, then it's safe to cache.
  if (!usingCdn && Array.isArray(options.next?.tags)) {
    revalidate = false;
  } else if (usingCdn) {
    revalidate = 60;
  }

  return queryStore.loadQuery(query, params, {
    ...options,
    next: {
      revalidate,
      ...(options.next || {}),
    },
    perspective,
    stega: { enabled: draftMode().isEnabled },
  });
}) satisfies typeof queryStore.loadQuery;
