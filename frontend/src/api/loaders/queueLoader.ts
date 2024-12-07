import type { QueryClient } from "@tanstack/react-query";
import { redirect, type LoaderFunction } from "react-router-dom";
import { matchListFactory } from "../compete/competeFactories";
import { buildKey, safeEnsureQueryData } from "../helpers";
import { searchTeamsFactory } from "../team/teamFactories";
import type { Episode } from "api/_autogen";
import { episodeInfoFactory } from "api/episode/episodeFactories";
import toast from "react-hot-toast";

export const queueLoader =
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
        `Queue page not released yet for ${(await episodeData).name_long}.`,
      );
      return redirect(`/${episodeId}/home`);
    }

    // All matches
    safeEnsureQueryData({ episodeId }, matchListFactory, queryClient);

    // All teams
    safeEnsureQueryData({ episodeId }, searchTeamsFactory, queryClient);

    return null;
  };
