import type { QueryClient } from "@tanstack/react-query";
import type { LoaderFunction } from "react-router-dom";
import { matchListFactory } from "../compete/competeFactories";
import { safeLoader } from "../helpers";
import { searchTeamsFactory } from "../team/teamFactories";

export const queueLoader =
  (queryClient: QueryClient): LoaderFunction =>
  ({ params }) => {
    const episodeId = params.episodeId;
    if (episodeId === undefined) return null;

    // All matches
    safeLoader({ episodeId }, matchListFactory, queryClient);

    // All teams
    safeLoader({ episodeId }, searchTeamsFactory, queryClient);

    return null;
  };
