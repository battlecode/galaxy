import type { QueryClient } from "@tanstack/react-query";
import { redirect, type LoaderFunction } from "react-router-dom";
import {
  subsListFactory,
  tournamentSubsListFactory,
} from "../compete/competeFactories";
import { buildKey, safeEnsureQueryData } from "../helpers";
import { type Episode, Status526Enum, type TeamPrivate } from "api/_autogen";
import { episodeInfoFactory } from "api/episode/episodeFactories";
import { myTeamFactory } from "api/team/teamFactories";
import toast from "react-hot-toast";

export const submissionsLoader =
  (queryClient: QueryClient): LoaderFunction =>
  async ({ params }) => {
    const { episodeId } = params;
    const page = !isNaN(parseInt(params.page ?? ""))
      ? parseInt(params.page ?? "")
      : 1;

    if (episodeId === undefined) return null;

    // Ensure that this page is available for the episode
    const episodeData = queryClient.ensureQueryData<Episode>({
      queryKey: buildKey(episodeInfoFactory.queryKey, { id: episodeId }),
      queryFn: async () => await episodeInfoFactory.queryFn({ id: episodeId }),
    });

    let teamData: TeamPrivate | null = null;
    try {
      teamData = await queryClient.ensureQueryData<TeamPrivate>({
        queryKey: buildKey(myTeamFactory.queryKey, { episodeId }),
        queryFn: async () => await myTeamFactory.queryFn({ episodeId }),
      });
    } catch {
      toast.error(`Please join a team to view Submissions.`);
      return redirect(`/${episodeId}/home`);
    }

    const isStaffTeam = teamData.status === Status526Enum.S;
    if (
      !isStaffTeam &&
      (await episodeData).game_release.getTime() > Date.now()
    ) {
      toast.error(
        `Submissions page not released yet for ${
          (await episodeData).name_long
        }.`,
      );
      return redirect(`/${episodeId}/home`);
    }

    // Submissions list
    safeEnsureQueryData({ episodeId, page }, subsListFactory, queryClient);

    // Tournament submissions list
    safeEnsureQueryData({ episodeId }, tournamentSubsListFactory, queryClient);

    return null;
  };
