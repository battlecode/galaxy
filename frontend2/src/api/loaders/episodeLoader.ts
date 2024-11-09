import { type QueryClient } from "@tanstack/react-query";
import { ResponseError } from "api/_autogen";
import { loginCheck } from "api/auth/authApi";
import { episodeInfoFactory } from "api/episode/episodeFactories";
import { ratingHistoryTop10Factory } from "api/compete/competeFactories";
import { buildKey, safeEnsureQueryData } from "api/helpers";
import { searchTeamsFactory, myTeamFactory } from "api/team/teamFactories";
import { type LoaderFunction } from "react-router-dom";

export const episodeLoader =
  (queryClient: QueryClient): LoaderFunction =>
  async ({ params }) => {
    // check if the episodeId is a valid one.
    // if the episode is not found, throw an error.
    const id = params.episodeId ?? "";
    if (id === "") {
      throw new ResponseError(
        new Response("Episode not found.", { status: 404 }),
      );
    }

    // Run a check to see if the user has an invalid token
    const loggedIn = await loginCheck(queryClient);

    // Await the episode info so we can be sure that it exists
    const episodeInfo = await queryClient.ensureQueryData({
      queryKey: buildKey(episodeInfoFactory.queryKey, { id }),
      queryFn: async () => await episodeInfoFactory.queryFn({ id }),
      staleTime: Infinity,
    });

    // Prefetch the top 10 ranked teams' rating histories
    safeEnsureQueryData(
      {
        episodeId: id,
        page: 1,
      },
      searchTeamsFactory,
      queryClient,
    );
    safeEnsureQueryData(
      { episodeId: id },
      ratingHistoryTop10Factory,
      queryClient,
    );

    // Prefetch the user's team
    if (loggedIn) {
      safeEnsureQueryData({ episodeId: id }, myTeamFactory, queryClient);
    }

    return episodeInfo;
  };
