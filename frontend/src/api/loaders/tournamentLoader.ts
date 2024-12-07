import type { QueryClient } from "@tanstack/react-query";
import { redirect, type LoaderFunction } from "react-router-dom";
import { buildKey, safeEnsureQueryData } from "../helpers";
import {
  episodeInfoFactory,
  tournamentInfoFactory,
} from "../episode/episodeFactories";
import { tournamentMatchListFactory } from "../compete/competeFactories";
import toast from "react-hot-toast";

export const tournamentLoader =
  (queryClient: QueryClient): LoaderFunction =>
  async ({ params }) => {
    const { episodeId, tournamentId } = params;
    if (episodeId === undefined || tournamentId === undefined) return null;

    // Episode Info
    safeEnsureQueryData({ id: episodeId }, episodeInfoFactory, queryClient);

    // Tournament Info
    try {
      const tournamentInfo = await queryClient.ensureQueryData({
        queryKey: buildKey(tournamentInfoFactory.queryKey, {
          episodeId,
          id: tournamentId,
        }),
        queryFn: async () =>
          await tournamentInfoFactory.queryFn({ episodeId, id: tournamentId }),
      });
      if (!tournamentInfo.is_public) {
        toast.error("This tournament is not public.");
        return redirect(`/${episodeId}/home`);
      }
    } catch (_) {
      return redirect(`/${episodeId}/home`);
    }

    // Tournament Match List
    safeEnsureQueryData(
      {
        episodeId,
        tournamentId,
      },
      tournamentMatchListFactory,
      queryClient,
    );

    return null;
  };
