import type { QueryClient } from "@tanstack/react-query";
import { buildKey } from "api/helpers";
import { loginTokenVerifyFactory } from "api/user/userFactories";
import { redirect, type LoaderFunction } from "react-router-dom";
import { DEFAULT_EPISODE } from "utils/constants";

export const homeIfLoggedIn =
  (queryClient: QueryClient): LoaderFunction =>
  async () => {
    // Check if user is logged in
    const loggedIn = await queryClient.ensureQueryData<boolean>({
      queryKey: buildKey(loginTokenVerifyFactory.queryKey, { queryClient }),
      queryFn: async () =>
        await loginTokenVerifyFactory.queryFn({ queryClient }),
    });

    if (loggedIn) {
      // If user is logged in, redirect to home
      return redirect(`/${DEFAULT_EPISODE}/home`);
    }
    return null;
  };
