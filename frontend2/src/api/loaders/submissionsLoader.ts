import type { QueryClient } from "@tanstack/react-query";
import type { LoaderFunction } from "react-router-dom";
import {
  subsListFactory,
  tournamentSubsListFactory,
} from "../compete/competeFactories";
import { safeEnsureQueryData } from "../helpers";

export const submissionsLoader =
  (queryClient: QueryClient): LoaderFunction =>
  ({ params }) => {
    const episodeId = params.episodeId;
    const page = !isNaN(parseInt(params.page ?? ""))
      ? parseInt(params.page ?? "")
      : 1;

    if (episodeId === undefined) return null;

    // Submissions list
    safeEnsureQueryData({ episodeId, page }, subsListFactory, queryClient);

    // Tournament submissions list
    safeEnsureQueryData({ episodeId }, tournamentSubsListFactory, queryClient);

    return null;
  };
