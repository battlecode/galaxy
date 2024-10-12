import type { QueryClient } from "@tanstack/react-query";
import type { LoaderFunction } from "react-router-dom";
import { safeEnsureQueryData } from "../helpers";
import {
  episodeInfoFactory,
  nextTournamentFactory,
} from "../episode/episodeFactories";
import {
  ratingHistoryMeFactory,
  scrimmagingRecordFactory,
} from "api/compete/competeFactories";
import { CompeteMatchScrimmagingRecordRetrieveScrimmageTypeEnum } from "api/_autogen";

export const homeLoader =
  (queryClient: QueryClient): LoaderFunction =>
  ({ params }) => {
    const episodeId = params.episodeId;
    if (episodeId === undefined) return null;

    // Episode Info
    safeEnsureQueryData({ id: episodeId }, episodeInfoFactory, queryClient);

    // Next Tournament
    safeEnsureQueryData({ episodeId }, nextTournamentFactory, queryClient);

    // User Team Rating History
    safeEnsureQueryData({ episodeId }, ratingHistoryMeFactory, queryClient);

    // User Team Scrimmage Record
    safeEnsureQueryData(
      {
        episodeId,
        scrimmageType:
          CompeteMatchScrimmagingRecordRetrieveScrimmageTypeEnum.All,
      },
      scrimmagingRecordFactory,
      queryClient,
    );

    return null;
  };
