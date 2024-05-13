import type { QueryClient } from "@tanstack/react-query";
import type { LoaderFunction } from "react-router-dom";
import { buildKey } from "../helpers";
import {
  episodeInfoFactory,
  nextTournamentFactory,
} from "../episode/episodeFactories";
import { ratingHistoryMeFactory } from "api/compete/competeFactories";

export const homeLoader =
  (queryClient: QueryClient): LoaderFunction =>
  ({ params }) => {
    const episodeId = params.episodeId;
    if (episodeId === undefined) return null;

    // Episode Info
    void queryClient.ensureQueryData({
      queryKey: buildKey(episodeInfoFactory.queryKey, { id: episodeId }),
      queryFn: async () => await episodeInfoFactory.queryFn({ id: episodeId }),
    });

    // Next Tournament
    void queryClient.ensureQueryData({
      queryKey: buildKey(nextTournamentFactory.queryKey, { episodeId }),
      queryFn: async () => await nextTournamentFactory.queryFn({ episodeId }),
    });

    // User Team Rating History
    void queryClient.ensureQueryData({
      queryKey: buildKey(ratingHistoryMeFactory.queryKey, { episodeId }),
      queryFn: async () => await ratingHistoryMeFactory.queryFn({ episodeId }),
    });

    return null;
  };
