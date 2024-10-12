import type { QueryClient } from "@tanstack/react-query";
import type { LoaderFunction } from "react-router-dom";
import {
  scrimmageInboxListFactory,
  scrimmageOutboxListFactory,
  scrimmagingRecordFactory,
  tournamentMatchListFactory,
  userScrimmageListFactory,
} from "../compete/competeFactories";
import { buildKey, safeLoader } from "../helpers";
import { myTeamFactory, searchTeamsFactory } from "../team/teamFactories";
import { CompeteMatchScrimmagingRecordRetrieveScrimmageTypeEnum } from "api/_autogen";

export const scrimmagingLoader =
  (queryClient: QueryClient): LoaderFunction =>
  async ({ params }) => {
    const episodeId = params.episodeId;

    if (episodeId === undefined) return null;

    // Outbox
    safeLoader({ episodeId }, scrimmageInboxListFactory, queryClient);

    // Inbox
    safeLoader({ episodeId }, scrimmageOutboxListFactory, queryClient);

    // Teams list
    safeLoader({ episodeId }, searchTeamsFactory, queryClient);

    // Scrimmage list
    safeLoader({ episodeId }, userScrimmageListFactory, queryClient);

    // My team info
    const myTeamInfo = await queryClient.ensureQueryData({
      queryKey: buildKey(myTeamFactory.queryKey, { episodeId }),
      queryFn: async () => await myTeamFactory.queryFn({ episodeId }),
    });

    // Scrimmaging record (all types)
    safeLoader(
      {
        episodeId,
        teamId: myTeamInfo.id,
        scrimmageType:
          CompeteMatchScrimmagingRecordRetrieveScrimmageTypeEnum.All,
      },
      scrimmagingRecordFactory,
      queryClient,
    );
    safeLoader(
      {
        episodeId,
        teamId: myTeamInfo.id,
        scrimmageType:
          CompeteMatchScrimmagingRecordRetrieveScrimmageTypeEnum.Ranked,
      },
      scrimmagingRecordFactory,
      queryClient,
    );
    safeLoader(
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
    safeLoader(
      {
        episodeId,
        teamId: myTeamInfo.id,
      },
      tournamentMatchListFactory,
      queryClient,
    );

    return null;
  };
