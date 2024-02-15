import type { QueryClient } from "@tanstack/react-query";
import type { LoaderFunction } from "react-router-dom";
import {
  subsListFactory,
  tournamentSubsListFactory,
} from "../compete/competeFactories";
import { buildKey } from "../helpers";

export const submissionsLoader =
  (queryClient: QueryClient): LoaderFunction =>
  async ({ params }) => {
    const episodeId = params.episodeId ?? "";
    const page = !isNaN(parseInt(params.page ?? ""))
      ? parseInt(params.page ?? "")
      : 1;

    try {
      // If we await these, will it take a long time to load the page?
      return await Promise.all([
        queryClient.ensureQueryData({
          queryKey: buildKey(subsListFactory.queryKey, { episodeId, page }),
          queryFn: async () =>
            await subsListFactory.queryFn(
              { episodeId, page },
              queryClient,
              true,
            ),
        }),
        queryClient.ensureQueryData({
          queryKey: buildKey(tournamentSubsListFactory.queryKey, { episodeId }),
          queryFn: async () =>
            await tournamentSubsListFactory.queryFn({ episodeId }),
        }),
        // queryClient.ensureQueryData({
        //   queryKey: episodeQueryKeys.nextTournament({ episodeId }),
        //   queryFn: async () => await new Promise((resolve) => resolve(null)),
        // }),
      ]);
      // void queryClient.ensureQueryData({
      //   queryKey: buildKey(subsListFactory.queryKey, { episodeId, page }),
      //   queryFn: async () =>
      //     await subsListFactory.queryFn({ episodeId, page }, queryClient, true),
      // });
      // void queryClient.ensureQueryData({
      //   queryKey: buildKey(tournamentSubsListFactory.queryKey, { episodeId }),
      //   queryFn: async () =>
      //     await tournamentSubsListFactory.queryFn({ episodeId }),
      // });
      // return true;
    } catch (e) {
      return null;
    }
  };
