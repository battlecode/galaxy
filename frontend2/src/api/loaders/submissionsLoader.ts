import type { QueryClient } from "@tanstack/react-query";
import type { LoaderFunction } from "react-router-dom";
import {
  subsListFactory,
  tournamentSubsListFactory,
} from "../compete/competeFactories";
import { buildKey } from "../helpers";

export const submissionsLoader =
  (queryClient: QueryClient): LoaderFunction =>
  ({ params }) => {
    const episodeId = params.episodeId;
    const page = !isNaN(parseInt(params.page ?? ""))
      ? parseInt(params.page ?? "")
      : 1;

    if (episodeId === undefined) return null;

    // Submissions list
    void queryClient.ensureQueryData({
      queryKey: buildKey(subsListFactory.queryKey, { episodeId, page }),
      queryFn: async () =>
        await subsListFactory.queryFn({ episodeId, page }, queryClient, true),
    });

    // Tournament submissions list
    void queryClient.ensureQueryData({
      queryKey: buildKey(tournamentSubsListFactory.queryKey, { episodeId }),
      queryFn: async () =>
        await tournamentSubsListFactory.queryFn({ episodeId }),
    });

    return null;
  };
