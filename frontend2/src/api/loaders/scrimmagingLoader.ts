import type { QueryClient } from "@tanstack/react-query";
import type { LoaderFunction } from "react-router-dom";
import {
  scrimmageInboxListFactory,
  scrimmageOutboxListFactory,
  scrimmagingRecordFactory,
  tournamentMatchListFactory,
  userScrimmageListFactory,
} from "../compete/competeFactories";
import { buildKey, safeEnsureQueryData } from "../helpers";
import { myTeamFactory, searchTeamsFactory } from "../team/teamFactories";
import { CompeteMatchScrimmagingRecordRetrieveScrimmageTypeEnum } from "api/_autogen";

export const scrimmagingLoader =
  (queryClient: QueryClient): LoaderFunction =>
  async ({ params }) => {
    const { episodeId } = params;

    if (episodeId === undefined) return null;

    // Outbox
    safeEnsureQueryData({ episodeId }, scrimmageInboxListFactory, queryClient);

    // Inbox
    safeEnsureQueryData({ episodeId }, scrimmageOutboxListFactory, queryClient);

    // Teams list
    safeEnsureQueryData({ episodeId }, searchTeamsFactory, queryClient);

    // Scrimmage list
    safeEnsureQueryData({ episodeId }, userScrimmageListFactory, queryClient);

    // My team info
    const myTeamInfo = await queryClient.ensureQueryData({
      queryKey: buildKey(myTeamFactory.queryKey, { episodeId }),
      queryFn: async () => await myTeamFactory.queryFn({ episodeId }),
    });

    // Scrimmaging record (all types)
    safeEnsureQueryData(
      {
        episodeId,
        teamId: myTeamInfo.id,
        scrimmageType:
          CompeteMatchScrimmagingRecordRetrieveScrimmageTypeEnum.All,
      },
      scrimmagingRecordFactory,
      queryClient,
    );
    safeEnsureQueryData(
      {
        episodeId,
        teamId: myTeamInfo.id,
        scrimmageType:
          CompeteMatchScrimmagingRecordRetrieveScrimmageTypeEnum.Ranked,
      },
      scrimmagingRecordFactory,
      queryClient,
    );
    safeEnsureQueryData(
      {
        episodeId,
        teamId: myTeamInfo.id,
        scrimmageType:
          CompeteMatchScrimmagingRecordRetrieveScrimmageTypeEnum.Unranked,
      },
      scrimmagingRecordFactory,
      queryClient,
    );

    // Tournament match list
    safeEnsureQueryData(
      {
        episodeId,
        teamId: myTeamInfo.id,
      },
      tournamentMatchListFactory,
      queryClient,
    );

    return null;
  };
