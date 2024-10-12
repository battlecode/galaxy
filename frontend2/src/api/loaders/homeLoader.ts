import type { QueryClient } from "@tanstack/react-query";
import type { LoaderFunction } from "react-router-dom";
import { safeLoader } from "../helpers";
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
    safeLoader({ id: episodeId }, episodeInfoFactory, queryClient);

    // Next Tournament
    safeLoader({ episodeId }, nextTournamentFactory, queryClient);

    // User Team Rating History
    safeLoader({ episodeId }, ratingHistoryMeFactory, queryClient);

    // User Team Scrimmage Record
    safeLoader(
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
