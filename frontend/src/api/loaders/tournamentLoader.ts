import type { QueryClient } from "@tanstack/react-query";
import type { LoaderFunction } from "react-router-dom";
import { safeEnsureQueryData } from "../helpers";
import {
  episodeInfoFactory,
  tournamentInfoFactory,
} from "../episode/episodeFactories";
import { tournamentMatchListFactory } from "../compete/competeFactories";

export const tournamentLoader =
  (queryClient: QueryClient): LoaderFunction =>
  ({ params }) => {
    const { episodeId, tournamentId } = params;
    if (episodeId === undefined || tournamentId === undefined) return null;

    // Episode Info
    safeEnsureQueryData({ id: episodeId }, episodeInfoFactory, queryClient);

    // Tournament Info
    safeEnsureQueryData(
      {
        episodeId,
        id: tournamentId,
      },
      tournamentInfoFactory,
      queryClient,
    );

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
