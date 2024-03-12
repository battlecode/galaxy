import type { QueryClient } from "@tanstack/react-query";
import type { LoaderFunction } from "react-router-dom";
import { episodeInfoFactory } from "../episode/episodeFactories";
import { buildKey } from "../helpers";
import { searchTeamsFactory } from "../team/teamFactories";

export const rankingsLoader =
  (queryClient: QueryClient): LoaderFunction =>
  ({ params }) => {
    const episodeId = params.episodeId;

    if (episodeId === undefined) return null;

    // Episode info
    void queryClient.ensureQueryData({
      queryKey: buildKey(episodeInfoFactory.queryKey, { id: episodeId }),
      queryFn: async () => await episodeInfoFactory.queryFn({ id: episodeId }),
    });

    // Team list (rankings)
    void queryClient.ensureQueryData({
      queryKey: buildKey(searchTeamsFactory.queryKey, { episodeId }),
      queryFn: async () =>
        await searchTeamsFactory.queryFn({ episodeId }, queryClient, true),
    });

    return null;
  };
