import type { QueryClient } from "@tanstack/react-query";
import { redirect, type LoaderFunction } from "react-router-dom";
import { safeEnsureQueryData } from "../helpers";
import { otherTeamInfoFactory } from "../team/teamFactories";
import toast from "react-hot-toast";
import { DEFAULT_EPISODE } from "utils/constants";

// loader for other team's public profile pages
export const teamProfileLoader =
  (queryClient: QueryClient): LoaderFunction =>
  ({ params }) => {
    const { teamId, episodeId } = params;
    if (teamId === undefined || episodeId === undefined) return null;

    // Load the team's info
    safeEnsureQueryData(
      {
        episodeId,
        id: teamId,
      },
      otherTeamInfoFactory,
      queryClient,
    );

    return null;
  };
