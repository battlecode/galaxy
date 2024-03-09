import { QueryClient } from "@tanstack/react-query";
import { LoaderFunction } from "react-router-dom";

export const myTeamLoader =
  (queryClient: QueryClient): LoaderFunction =>
  ({ params }) => {
    const episodeId = params.episodeId;

    if (episodeId === undefined) return null;

    return null;
  };
