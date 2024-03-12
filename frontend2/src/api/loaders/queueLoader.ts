import type { QueryClient } from "@tanstack/react-query";
import type { LoaderFunction } from "react-router-dom";
import { matchListFactory } from "../compete/competeFactories";
import { buildKey } from "../helpers";
import { searchTeamsFactory } from "../team/teamFactories";

export const queueLoader =
  (queryClient: QueryClient): LoaderFunction =>
  ({ params }) => {
    const episodeId = params.episodeId;
    if (episodeId === undefined) return null;

    // All matches
    void queryClient.ensureQueryData({
      queryKey: buildKey(matchListFactory.queryKey, { episodeId }),
      queryFn: async () =>
        await matchListFactory.queryFn({ episodeId }, queryClient, true),
    });

    // All teams
    void queryClient.ensureQueryData({
      queryKey: buildKey(searchTeamsFactory.queryKey, { episodeId }),
      queryFn: async () =>
        await searchTeamsFactory.queryFn({ episodeId }, queryClient, true),
    });

    return null;
  };
