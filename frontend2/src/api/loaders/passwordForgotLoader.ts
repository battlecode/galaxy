import type { QueryClient } from "@tanstack/react-query";
import { loginCheck } from "api/auth/authApi";
import { type LoaderFunction } from "react-router-dom";
import { DEFAULT_EPISODE } from "utils/constants";

export const passwordForgotLoader =
  (queryClient: QueryClient): LoaderFunction =>
  async () => {
    // Check if user is logged in
    if (await loginCheck(queryClient)) {
      // If user is logged in, redirect to home
      window.location.href = `/${DEFAULT_EPISODE}/home`;
    }
    return null;
  };
