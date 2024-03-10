import Cookies from "js-cookie";
import { Configuration, type ResponseError } from "./_autogen";
import type {
  PaginatedQueryFuncBuilder,
  PaginatedRequestMinimal,
  PaginatedResultMinimal,
  QueryKeyBuilder,
} from "./apiTypes";
import type { QueryClient, QueryKey } from "@tanstack/react-query";
import { isPresent } from "../utils/utilTypes";
import toast from "react-hot-toast";

// fall back to localhost for now
export const BASE_URL =
  process.env.REACT_APP_BACKEND_URL ?? "http://localhost:8000";

export const DEFAULT_API_CONFIGURATION = new Configuration({
  basePath: BASE_URL,
  accessToken: () => Cookies.get("access") as string,
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

export const buildKey = <T>(
  keyBuilder: QueryKeyBuilder<T>,
  request: T,
): QueryKey => {
  return keyBuilder.key(request);
};

/**
 * Given a paginated query result, prefetch the next page of table data if it exists.
 * @param request the original request
 * @param result the result of the original request
 * @param queryKey the `QueryKeyBuilder` for converting the request into a hashable key
 * @param queryFn the function to call to fetch the next page
 * @param queryClient the reference to the query client
 */
export const prefetchNextPage = async <
  T extends PaginatedRequestMinimal,
  K extends PaginatedResultMinimal,
>(
  request: T,
  result: PaginatedResultMinimal,
  queryKey: QueryKeyBuilder<T>,
  queryFn: PaginatedQueryFuncBuilder<T, K>,
  queryClient: QueryClient,
): Promise<void> => {
  if (isPresent(result.next)) {
    // If no page provided, then we just fetched page 1
    const nextPage = isPresent(request.page) ? request.page + 1 : 2;
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
};
