import type { QueryClient } from "@tanstack/react-query";
import type { LoaderFunction } from "react-router-dom";
import { myTeamFactory } from "../team/teamFactories";
import { buildKey } from "../helpers";
import { isNil } from "lodash";
import { scrimmagingRecordFactory } from "api/compete/competeFactories";
import {
  CompeteMatchScrimmagingRecordRetrieveScrimmageTypeEnum,
  type TeamPrivate,
} from "api/_autogen";

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

    // Win/loss/tie
    const teamDataCached = queryClient.getQueryData<TeamPrivate>(
      buildKey(myTeamFactory.queryKey, { episodeId }),
    );

    if (!isNil(teamDataCached)) {
      void queryClient.ensureQueryData({
        queryKey: buildKey(scrimmagingRecordFactory.queryKey, {
          episodeId,
          teamId: teamDataCached.id,
          scrimmageType:
            CompeteMatchScrimmagingRecordRetrieveScrimmageTypeEnum.Ranked,
        }),
      });

      void queryClient.ensureQueryData({
        queryKey: buildKey(scrimmagingRecordFactory.queryKey, {
          episodeId,
          teamId: teamDataCached.id,
          scrimmageType:
            CompeteMatchScrimmagingRecordRetrieveScrimmageTypeEnum.Unranked,
        }),
      });

      void queryClient.ensureQueryData({
        queryKey: buildKey(scrimmagingRecordFactory.queryKey, {
          episodeId,
          teamId: teamDataCached.id,
          scrimmageType:
            CompeteMatchScrimmagingRecordRetrieveScrimmageTypeEnum.All,
        }),
      });
    }

    return null;
  };
