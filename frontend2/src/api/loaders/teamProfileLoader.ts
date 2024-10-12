import type { QueryClient } from "@tanstack/react-query";
import type { LoaderFunction } from "react-router-dom";
import { safeEnsureQueryData } from "../helpers";
import { otherTeamInfoFactory } from "../team/teamFactories";

// loader for other team's public profile pages
export const teamProfileLoader =
  (queryClient: QueryClient): LoaderFunction =>
  ({ params }) => {
    const episodeId = params.episodeId;
    const teamId = params.teamId;
    if (teamId === undefined || episodeId === undefined) return null;

    // All teams
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
