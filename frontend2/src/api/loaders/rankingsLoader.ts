import type { QueryClient } from "@tanstack/react-query";
import { redirect, type LoaderFunction } from "react-router-dom";
import { episodeInfoFactory } from "../episode/episodeFactories";
import { buildKey, safeEnsureQueryData } from "../helpers";
import { searchTeamsFactory } from "../team/teamFactories";
import { type Episode } from "api/_autogen";
import toast from "react-hot-toast";

export const rankingsLoader =
  (queryClient: QueryClient): LoaderFunction =>
  async ({ params }) => {
    const episodeId = params.episodeId;

    if (episodeId === undefined) return null;

    // Ensure that this page is available for the episode
    const episodeData = queryClient.ensureQueryData<Episode>({
      queryKey: buildKey(episodeInfoFactory.queryKey, { id: episodeId }),
      queryFn: async () => await episodeInfoFactory.queryFn({ id: episodeId }),
    });

    if ((await episodeData).game_release.getTime() > Date.now()) {
      toast.error(
        `Rankings page not released yet for ${(await episodeData).name_long}.`,
      );
      return redirect(`/${episodeId}/home`);
    }

    // Episode info
    safeEnsureQueryData({ id: episodeId }, episodeInfoFactory, queryClient);

    // Team list (rankings)
    safeEnsureQueryData({ episodeId }, searchTeamsFactory, queryClient);

    return null;
  };
