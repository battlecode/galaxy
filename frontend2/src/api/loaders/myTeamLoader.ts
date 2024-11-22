import type { QueryClient } from "@tanstack/react-query";
import type { LoaderFunction } from "react-router-dom";
import { myTeamFactory } from "../team/teamFactories";
import { buildKey, safeEnsureQueryData } from "../helpers";
import { scrimmagingRecordFactory } from "api/compete/competeFactories";
import { CompeteMatchScrimmagingRecordRetrieveScrimmageTypeEnum } from "api/_autogen";
import toast from "react-hot-toast";

export const myTeamLoader =
  (queryClient: QueryClient): LoaderFunction =>
  async ({ params }) => {
    const { episodeId } = params;

    if (episodeId === undefined) return null;

    // My team info
    try {
      await queryClient.ensureQueryData({
        queryKey: buildKey(myTeamFactory.queryKey, { episodeId }),
        queryFn: async () => await myTeamFactory.queryFn({ episodeId }),
      });
    } catch {
      toast("Join a team to compete!");
    }

    // Ranked and Unranked Scrimmage Record
    safeEnsureQueryData(
      {
        episodeId,
        scrimmageType:
          CompeteMatchScrimmagingRecordRetrieveScrimmageTypeEnum.Ranked,
      },
      scrimmagingRecordFactory,
      queryClient,
    );
    safeEnsureQueryData(
      {
        episodeId,
        scrimmageType:
          CompeteMatchScrimmagingRecordRetrieveScrimmageTypeEnum.Unranked,
      },
      scrimmagingRecordFactory,
      queryClient,
    );

    return null;
  };
