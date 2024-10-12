import type { QueryClient } from "@tanstack/react-query";
import type { LoaderFunction } from "react-router-dom";
import { episodeInfoFactory } from "../episode/episodeFactories";
import { safeLoader } from "../helpers";
import { searchTeamsFactory } from "../team/teamFactories";

export const rankingsLoader =
  (queryClient: QueryClient): LoaderFunction =>
  ({ params }) => {
    const episodeId = params.episodeId;

    if (episodeId === undefined) return null;

    // Episode info
    safeLoader({ id: episodeId }, episodeInfoFactory, queryClient);

    // Team list (rankings)
    safeLoader({ episodeId }, searchTeamsFactory, queryClient);

    return null;
  };
