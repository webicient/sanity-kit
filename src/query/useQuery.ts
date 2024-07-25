import {
  type QueryParams,
  type QueryResponseInitial,
  type UseQueryOptionsDefinedInitial,
} from "@sanity/react-loader";
import * as queryStore from "@sanity/react-loader";

/**
 * Exports to be used in client-only or components that render both server and client
 * side, such as `sanity/presentation`.
 *
 * @param query - The query to load
 * @param params - The parameters for the query
 * @param options - The options for the query
 * @returns The result of the query
 */
export const useQuery = <
  QueryResponseResult = unknown,
  QueryResponseError = unknown,
>(
  query: string,
  params?: QueryParams,
  options?: UseQueryOptionsDefinedInitial<QueryResponseResult>,
): QueryResponseInitial<QueryResponseResult> => {
  const snapshot = queryStore.useQuery<QueryResponseResult, QueryResponseError>(
    query,
    params,
    options,
  );

  // Always throw errors if there are any.
  if (snapshot.error) {
    // eslint-disable-next-line @typescript-eslint/no-throw-literal -- This is an error
    throw snapshot.error;
  }

  return snapshot as QueryResponseInitial<QueryResponseResult>;
};
