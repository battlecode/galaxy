import type { URLSearchParams } from "url";

export const getParamEntries = (
  prev: URLSearchParams,
): Record<string, string> => {
  return Object.fromEntries(prev);
};

export const parsePageParam = (
  paramName: string,
  searchParams: URLSearchParams,
): number => parseInt(searchParams.get(paramName) ?? "1");
