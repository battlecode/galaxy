import Cookies from "js-cookie";
import {
  Configuration,
  type EligibilityCriterion,
  type ResponseError,
} from "./_autogen";
import type {
  PaginatedQueryFactory,
  PaginatedRequestMinimal,
  PaginatedResultMinimal,
  QueryFactory,
  QueryKeyBuilder,
} from "./apiTypes";
import type { QueryClient, QueryKey } from "@tanstack/react-query";
import { isPresent } from "../utils/utilTypes";
import toast from "react-hot-toast";
import { isNil } from "lodash";

export const BASE_URL = import.meta.env.VITE_BACKEND_URL as string | undefined;

export const DEFAULT_API_CONFIGURATION = new Configuration({
  basePath: BASE_URL,
  accessToken: () => Cookies.get("access") ?? "",
});

export const downloadFile = async (
  url: string,
  downloadFileName: string,
): Promise<void> => {
  const response = await fetch(url);
  const blob = await response.blob();

  // trigger download in user's browser
  const objUrl = window.URL.createObjectURL(blob);
  const aHelper = document.createElement("a");
  aHelper.style.display = "none";
  aHelper.href = objUrl;
  aHelper.download = downloadFileName;
  document.body.appendChild(aHelper);
  aHelper.click();
  window.URL.revokeObjectURL(objUrl);
};

/**
 * Build a hashable `QueryKey` from a request object and a `QueryKeyBuilder`.
 * This is the preferred way to build a `QueryKey`, as not all `QueryKeyBuilder`s are directly callable
 *  (i.e. `builder.key(request)` may throw a static error).
 * @param keyBuilder the `QueryKeyBuilder` to use a a template for building the key
 * @param request the request object to populate the determining fields of the key
 * @returns a hashable `QueryKey` that can be used as a `queryKey` in a `useQuery` hook
 */
export const buildKey = <T>(
  keyBuilder: QueryKeyBuilder<T>,
  request: T,
): QueryKey => keyBuilder.key(request);

/**
 * Given a paginated query result, prefetch the next page of table data if it exists.
 * @param request the original request
 * @param result the result of the original request
 * @param queryKey the `QueryKeyBuilder` for converting the request into a hashable key
 * @param queryFn the function to call to fetch the next page
 * @param queryClient the reference to the query client
 */
export async function prefetchNextPage<
  T extends PaginatedRequestMinimal,
  K extends PaginatedResultMinimal,
>(
  request: T,
  result: PaginatedResultMinimal,
  { queryKey, queryFn }: PaginatedQueryFactory<T, K>,
  queryClient: QueryClient,
): Promise<void> {
  if (isPresent(result.next)) {
    // If no page provided, then we just fetched page 1
    const nextPage = (request.page ?? 1) + 1;
    try {
      await queryClient.prefetchQuery({
        queryKey: buildKey(queryKey, { ...request, page: nextPage }),
        queryFn: async () =>
          await queryFn({ ...request, page: nextPage }, queryClient, false),
      });
    } catch (e) {
      toast.error((e as ResponseError).message);
    }
  }
}

const safeEnsureQueryDataHelper = async <T, K>(
  request: T,
  factory: QueryFactory<T, K> | PaginatedQueryFactory<T, K>,
  queryClient: QueryClient,
): Promise<void> => {
  try {
    await queryClient.ensureQueryData({
      queryKey: buildKey(factory.queryKey, request),
      // TypeScript allows passing in extra params so this works for regular & paginated
      queryFn: async () => await factory.queryFn(request, queryClient, true),
    });
  } catch (_) {
    // This error will have toasted from the QueryClient if necessary
  }
};

/**
 * Given a request and query identification, safely ensure that the query data exists
 * or is fetched with no risk of throwing a Runtime Error. If the request has a server
 * error, it will be displayed as a toast.
 * @param request the parameters of the request
 * @param queryKey
 * @param queryFn
 * @param queryClient
 */
export const safeEnsureQueryData = <T, K>(
  request: T,
  factory: QueryFactory<T, K> | PaginatedQueryFactory<T, K>,
  queryClient: QueryClient,
): void => {
  void safeEnsureQueryDataHelper(request, factory, queryClient);
};

export const isNilOrEmptyStr = (str: string | undefined | null): boolean =>
  isNil(str) || str === "";

export const getEligibilities = (
  criteria: EligibilityCriterion[],
  eligibilityIds: number[],
): EligibilityCriterion[] =>
  eligibilityIds.flatMap((id) => criteria.find((ec) => ec.id === id) ?? []);

export const getClientUrl = (
  episodeId?: string,
  artifactName?: string,
  clientVersion?: string,
  gameSource: string | null | undefined = "",
): string | undefined => {
  if (
    !isPresent(episodeId) ||
    !isPresent(artifactName) ||
    !isPresent(clientVersion)
  ) {
    return undefined;
  }

  switch (episodeId) {
    case "bc22":
    case "bc23":
      return `https://releases.battlecode.org/client/${artifactName}/${clientVersion}/visualizer.html${
        !isNilOrEmptyStr(gameSource) ? `?${gameSource}` : ""
      }`;
    default:
      return `https://releases.battlecode.org/client/${artifactName}/${clientVersion}/index.html${
        !isNilOrEmptyStr(gameSource) ? `?gameSource=${gameSource}` : ""
      }`;
  }
};

export function classNames(...classes: string[]): string {
  return classes.filter(Boolean).join(" ");
}
