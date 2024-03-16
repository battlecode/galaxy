import type { QueryClient } from "@tanstack/react-query";
import type { LoaderFunction } from "react-router-dom";
import { buildKey } from "../helpers";
import {
  episodeInfoFactory,
  tournamentInfoFactory,
} from "../episode/episodeFactories";
import { tournamentMatchListFactory } from "../compete/competeFactories";

export const tournamentLoader =
  (queryClient: QueryClient): LoaderFunction =>
  ({ params }) => {
    const episodeId = params.episodeId;
    const tournamentId = params.tournamentId;
    if (episodeId === undefined || tournamentId === undefined) return null;

    // Episode Info
    void queryClient.ensureQueryData({
      queryKey: buildKey(episodeInfoFactory.queryKey, { id: episodeId }),
      queryFn: async () => await episodeInfoFactory.queryFn({ id: episodeId }),
    });

    // Tournament Info
    void queryClient.ensureQueryData({
      queryKey: buildKey(tournamentInfoFactory.queryKey, {
        episodeId,
        id: tournamentId,
      }),
      queryFn: async () =>
        await tournamentInfoFactory.queryFn({ episodeId, id: tournamentId }),
    });

    // Tournament Match List
    void queryClient.ensureQueryData({
      queryKey: buildKey(tournamentMatchListFactory.queryKey, {
        episodeId,
        tournamentId,
      }),
      queryFn: async () =>
        await tournamentMatchListFactory.queryFn(
          { episodeId, tournamentId },
          queryClient,
          true,
        ),
    });

    return null;
  };
