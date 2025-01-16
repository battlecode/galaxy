import type { QueryClient } from "@tanstack/react-query";
import { buildKey } from "api/helpers";
import { myUserInfoFactory } from "api/user/userFactories";
import { type LoaderFunction, redirect } from "react-router-dom";

export const adminTournamentLoader =
  (queryClient: QueryClient): LoaderFunction =>
  async ({ params }) => {
    const { episodeId, tournamentId } = params;
    if (episodeId === undefined) return null;
    if (tournamentId === undefined) return redirect(`/${episodeId}/home`);

    // Ensure the user is a staff member
    const user = queryClient.ensureQueryData({
      queryKey: buildKey(myUserInfoFactory.queryKey, {}),
      queryFn: async () => await myUserInfoFactory.queryFn({}),
    });

    try {
      if (!(await user).is_staff)
        return redirect(`/${episodeId}/tournament/${tournamentId}`);
    } catch (_) {
      return redirect(`/${episodeId}/tournament/${tournamentId}`);
    }

    return null;
  };
