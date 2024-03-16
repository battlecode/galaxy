import type { QueryClient } from "@tanstack/react-query";
import type { LoaderFunction } from "react-router-dom";
import {
  scrimmageInboxListFactory,
  scrimmageOutboxListFactory,
  tournamentMatchListFactory,
  userScrimmageListFactory,
} from "../compete/competeFactories";
import { buildKey } from "../helpers";
import { myTeamFactory, searchTeamsFactory } from "../team/teamFactories";

export const scrimmagingLoader =
  (queryClient: QueryClient): LoaderFunction =>
  async ({ params }) => {
    const episodeId = params.episodeId;

    if (episodeId === undefined) return null;

    // Outbox
    void queryClient.ensureQueryData({
      queryKey: buildKey(scrimmageInboxListFactory.queryKey, { episodeId }),
      queryFn: async () =>
        await scrimmageInboxListFactory.queryFn(
          { episodeId },
          queryClient,
          true,
        ),
    });

    // Inbox
    void queryClient.ensureQueryData({
      queryKey: buildKey(scrimmageOutboxListFactory.queryKey, { episodeId }),
      queryFn: async () =>
        await scrimmageOutboxListFactory.queryFn(
          { episodeId },
          queryClient,
          true,
        ),
    });

    // Teams list
    void queryClient.ensureQueryData({
      queryKey: buildKey(searchTeamsFactory.queryKey, { episodeId }),
      queryFn: async () =>
        await searchTeamsFactory.queryFn({ episodeId }, queryClient, true),
    });

    // Scrimmage list
    void queryClient.ensureQueryData({
      queryKey: buildKey(userScrimmageListFactory.queryKey, { episodeId }),
      queryFn: async () =>
        await userScrimmageListFactory.queryFn(
          { episodeId },
          queryClient,
          true,
        ),
    });

    // My team info
    const myTeamInfo = await queryClient.ensureQueryData({
      queryKey: buildKey(myTeamFactory.queryKey, { episodeId }),
      queryFn: async () => await myTeamFactory.queryFn({ episodeId }),
    });

    // Tournament match list
    void queryClient.ensureQueryData({
      queryKey: buildKey(tournamentMatchListFactory.queryKey, {
        episodeId,
        teamId: myTeamInfo.id,
      }),
      queryFn: async () =>
        await tournamentMatchListFactory.queryFn(
          { episodeId },
          queryClient,
          true,
        ),
    });

    return null;
  };
