import type { QueryClient } from "@tanstack/react-query";
import type { LoaderFunction } from "react-router-dom";
import { buildKey } from "../helpers";
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

    // User Team Scrimmage Record
    void queryClient.ensureQueryData({
      queryKey: buildKey(scrimmagingRecordFactory.queryKey, {
        episodeId,
        scrimmageType:
          CompeteMatchScrimmagingRecordRetrieveScrimmageTypeEnum.All,
      }),
      queryFn: async () =>
        await scrimmagingRecordFactory.queryFn({
          episodeId,
          scrimmageType:
            CompeteMatchScrimmagingRecordRetrieveScrimmageTypeEnum.All,
        }),
    });

    return null;
  };
