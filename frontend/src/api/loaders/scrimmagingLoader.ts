import type { QueryClient } from "@tanstack/react-query";
import { redirect, type LoaderFunction } from "react-router-dom";
import {
  scrimmageInboxListFactory,
  scrimmageOutboxListFactory,
  scrimmagingRecordFactory,
  tournamentMatchListFactory,
  userScrimmageListFactory,
} from "../compete/competeFactories";
import { buildKey, safeEnsureQueryData } from "../helpers";
import { myTeamFactory, searchTeamsFactory } from "../team/teamFactories";
import {
  CompeteMatchScrimmagingRecordRetrieveScrimmageTypeEnum,
  type Episode,
  type TeamPrivate,
} from "api/_autogen";
import { episodeInfoFactory } from "api/episode/episodeFactories";
import toast from "react-hot-toast";

export const scrimmagingLoader =
  (queryClient: QueryClient): LoaderFunction =>
  async ({ params }) => {
    const { episodeId } = params;

    if (episodeId === undefined) return null;

    // Ensure that this page is available for the episode
    const episodeData = queryClient.ensureQueryData<Episode>({
      queryKey: buildKey(episodeInfoFactory.queryKey, { id: episodeId }),
      queryFn: async () => await episodeInfoFactory.queryFn({ id: episodeId }),
    });

    if ((await episodeData).game_release.getTime() > Date.now()) {
      toast.error(
        `Scrimmaging page not released yet for ${
          (await episodeData).name_long
        }.`,
      );
      return redirect(`/${episodeId}/home`);
    }

    try {
      await queryClient.ensureQueryData<TeamPrivate>({
        queryKey: buildKey(myTeamFactory.queryKey, { episodeId }),
        queryFn: async () => await myTeamFactory.queryFn({ episodeId }),
      });
    } catch {
      toast.error(`Please join a team to view Scrimmaging.`);
      return redirect(`/${episodeId}/home`);
    }

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
