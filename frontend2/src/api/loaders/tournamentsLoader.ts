import type { QueryClient } from "@tanstack/react-query";
import type { LoaderFunction } from "react-router-dom";
import { tournamentListFactory } from "../episode/episodeFactories";
import { buildKey } from "../helpers";

export const tournamentsLoader =
  (queryClient: QueryClient): LoaderFunction =>
  ({ params }) => {
    const episodeId = params.episodeId;
    if (episodeId === undefined) return null;

    // Tournament list
    void queryClient.ensureQueryData({
      queryKey: buildKey(tournamentListFactory.queryKey, { episodeId }),
      queryFn: async () =>
        await tournamentListFactory.queryFn({ episodeId }, queryClient, true),
    });

    return null;
  };
