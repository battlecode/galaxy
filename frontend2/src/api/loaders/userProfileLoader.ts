import type { QueryClient } from "@tanstack/react-query";
import type { LoaderFunction } from "react-router-dom";
import { safeEnsureQueryData } from "../helpers";
import { otherUserTeamsFactory } from "../user/userFactories";

// loader for other team's public profile pages
export const userProfileLoader =
  (queryClient: QueryClient): LoaderFunction =>
  ({ params }) => {
    const { episodeId } = params;
    const { userId } = params;
    if (userId === undefined || episodeId === undefined) return null;
    const id = parseInt(userId, 10);

    // All teams
    safeEnsureQueryData(
      {
        id,
      },
      otherUserTeamsFactory,
      queryClient,
    );

    return null;
  };
