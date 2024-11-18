import type { QueryClient } from "@tanstack/react-query";
import type { LoaderFunction } from "react-router-dom";
import { episodeInfoFactory } from "../episode/episodeFactories";
import { safeEnsureQueryData } from "../helpers";
import { searchTeamsFactory } from "../team/teamFactories";

export const rankingsLoader =
  (queryClient: QueryClient): LoaderFunction =>
  ({ params }) => {
    const { episodeId } = params;

    if (episodeId === undefined) return null;

    // Episode info
    safeEnsureQueryData({ id: episodeId }, episodeInfoFactory, queryClient);

    // Team list (rankings)
    safeEnsureQueryData({ episodeId }, searchTeamsFactory, queryClient);

    return null;
  };
