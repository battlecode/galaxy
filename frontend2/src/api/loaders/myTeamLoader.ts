import type { QueryClient } from "@tanstack/react-query";
import type { LoaderFunction } from "react-router-dom";
import { myTeamFactory } from "../team/teamFactories";
import { buildKey } from "../helpers";

export const myTeamLoader =
  (queryClient: QueryClient): LoaderFunction =>
  ({ params }) => {
    const episodeId = params.episodeId;

    if (episodeId === undefined) return null;

    // My team info
    void queryClient.ensureQueryData({
      queryKey: buildKey(myTeamFactory.queryKey, { episodeId }),
      queryFn: async () => await myTeamFactory.queryFn({ episodeId }),
    });

    return null;
  };
