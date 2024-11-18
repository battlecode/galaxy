import type { QueryClient } from "@tanstack/react-query";
import type { LoaderFunction } from "react-router-dom";
import { matchListFactory } from "../compete/competeFactories";
import { safeEnsureQueryData } from "../helpers";
import { searchTeamsFactory } from "../team/teamFactories";

export const queueLoader =
  (queryClient: QueryClient): LoaderFunction =>
  ({ params }) => {
    const { episodeId } = params;
    if (episodeId === undefined) return null;

    // All matches
    safeEnsureQueryData({ episodeId }, matchListFactory, queryClient);

    // All teams
    safeEnsureQueryData({ episodeId }, searchTeamsFactory, queryClient);

    return null;
  };
