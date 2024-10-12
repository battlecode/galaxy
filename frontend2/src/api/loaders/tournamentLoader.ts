import type { QueryClient } from "@tanstack/react-query";
import type { LoaderFunction } from "react-router-dom";
import { safeLoader } from "../helpers";
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
    safeLoader({ id: episodeId }, episodeInfoFactory, queryClient);

    // Tournament Info
    safeLoader(
      {
        episodeId,
        id: tournamentId,
      },
      tournamentInfoFactory,
      queryClient,
    );

    // Tournament Match List
    safeLoader(
      {
        episodeId,
        tournamentId,
      },
      tournamentMatchListFactory,
      queryClient,
    );

    return null;
  };
