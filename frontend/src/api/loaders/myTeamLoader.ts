import type { QueryClient } from "@tanstack/react-query";
import type { LoaderFunction } from "react-router-dom";
import { myTeamFactory } from "../team/teamFactories";
import { safeEnsureQueryData } from "../helpers";
import { scrimmagingRecordFactory } from "api/compete/competeFactories";

export const myTeamLoader =
  (queryClient: QueryClient): LoaderFunction =>
  ({ params }) => {
    const { episodeId } = params;

    if (episodeId === undefined) return null;

    // My team info
    safeEnsureQueryData({ episodeId }, myTeamFactory, queryClient);

    // Ranked and Unranked Scrimmage Record
    safeEnsureQueryData(
      {
        episodeId,
      },
      scrimmagingRecordFactory,
      queryClient,
    );

    return null;
  };
