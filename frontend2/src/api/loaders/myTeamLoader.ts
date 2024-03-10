import type { QueryClient } from "@tanstack/react-query";
import type { LoaderFunction } from "react-router-dom";

export const myTeamLoader =
  (queryClient: QueryClient): LoaderFunction =>
  ({ params }) => {
    const episodeId = params.episodeId;

    if (episodeId === undefined) return null;

    // needs: useUserTeam

    return null;
  };
