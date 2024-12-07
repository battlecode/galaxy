import type { QueryClient } from "@tanstack/react-query";
import type { LoaderFunction } from "react-router-dom";
import { tournamentListFactory } from "../episode/episodeFactories";
import { safeEnsureQueryData } from "../helpers";

export const tournamentsLoader =
  (queryClient: QueryClient): LoaderFunction =>
  ({ params }) => {
    const { episodeId } = params;
    if (episodeId === undefined) return null;

    // Tournament list
    safeEnsureQueryData({ episodeId }, tournamentListFactory, queryClient);

    return null;
  };
