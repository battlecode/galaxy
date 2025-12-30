import type { QueryClient } from "@tanstack/react-query";
import { matchInfoFactory } from "api/compete/competeFactories";
import { safeEnsureQueryData } from "api/helpers";
import type { LoaderFunction } from "react-router-dom";
import { isPresent } from "utils/utilTypes";

export const matchProfileLoader =
  (queryClient: QueryClient): LoaderFunction =>
  ({ params }) => {
    const { episodeId, id } = params;

    if (!isPresent(id) || !isPresent(episodeId)) return null;

    // Load match info
    safeEnsureQueryData(
      {
        episodeId,
        id,
      },
      matchInfoFactory,
      queryClient,
    );

    return null;
  };
