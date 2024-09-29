import type { QueryClient } from "@tanstack/react-query";
import type { LoaderFunction } from "react-router-dom";
import { myTeamFactory } from "../team/teamFactories";
import { buildKey } from "../helpers";
import { scrimmagingRecordFactory } from "api/compete/competeFactories";
import { CompeteMatchScrimmagingRecordRetrieveScrimmageTypeEnum } from "api/_autogen";

export const myTeamLoader =
  (queryClient: QueryClient): LoaderFunction =>
  ({ params }) => {
    const episodeId = params.episodeId;

    if (episodeId === undefined) return null;

    // My team info
    void queryClient.ensureQueryData({
      queryKey: buildKey(myTeamFactory.queryKey, { episodeId }),
      queryFn: async () => await myTeamFactory.queryFn({ episodeId }),
    });

    // Ranked and Unranked Scrimmage Record
    void queryClient.ensureQueryData({
      queryKey: buildKey(scrimmagingRecordFactory.queryKey, {
        episodeId,
        scrimmageType:
          CompeteMatchScrimmagingRecordRetrieveScrimmageTypeEnum.Ranked,
      }),
      queryFn: async () =>
        await scrimmagingRecordFactory.queryFn({
          episodeId,
          scrimmageType:
            CompeteMatchScrimmagingRecordRetrieveScrimmageTypeEnum.Ranked,
        }),
    });
    void queryClient.ensureQueryData({
      queryKey: buildKey(scrimmagingRecordFactory.queryKey, {
        episodeId,
        scrimmageType:
          CompeteMatchScrimmagingRecordRetrieveScrimmageTypeEnum.Unranked,
      }),
      queryFn: async () =>
        await scrimmagingRecordFactory.queryFn({
          episodeId,
          scrimmageType:
            CompeteMatchScrimmagingRecordRetrieveScrimmageTypeEnum.Unranked,
        }),
    });

    return null;
  };
