import type { QueryClient } from "@tanstack/react-query";
import type { LoaderFunction } from "react-router-dom";
import { tournamentListFactory } from "../episode/episodeFactories";
import { safeLoader } from "../helpers";

export const tournamentsLoader =
  (queryClient: QueryClient): LoaderFunction =>
  ({ params }) => {
    const episodeId = params.episodeId;
    if (episodeId === undefined) return null;

    // Tournament list
    safeLoader({ episodeId }, tournamentListFactory, queryClient);

    return null;
  };
