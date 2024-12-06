import { TokenApi } from "../_autogen";
import Cookies from "js-cookie";
import { buildKey, DEFAULT_API_CONFIGURATION } from "../helpers";
import type { QueryClient } from "@tanstack/react-query";
import { userQueryKeys } from "../user/userKeys";
import { loginTokenVerifyFactory } from "api/user/userFactories";

/** This file contains all frontend authentication functions. Responsible for interacting with Cookies and expiring/setting JWT tokens. */
const API = new TokenApi(DEFAULT_API_CONFIGURATION);

/**
 * Set the access and refresh tokens in the browser's cookies.
 * @param username The username of the user.
 * @param password The password of the user.
 */
export const login = async (
  username: string,
  password: string,
  queryClient: QueryClient,
): Promise<void> => {
  const tokenObtainPairRequest = {
    username,
    password,
  };

  const res = await API.tokenCreate({ tokenObtainPairRequest });

  Cookies.set("access", res.access);
  Cookies.set("refresh", res.refresh);

  queryClient.setQueryData<boolean>(
    buildKey(loginTokenVerifyFactory.queryKey, { queryClient }),
    true,
  );

  await queryClient.refetchQueries({
    // OK to call KEY.key() here as we are refetching all user-me queries.
    queryKey: userQueryKeys.meBase.key(),
  });
};

/**
 * Removes the access and refresh tokens in the browser's cookies.
 * @param username The username of the user.
 * @param password The password of the user.
 */
export const logout = async (queryClient: QueryClient): Promise<void> => {
  Cookies.remove("access");
  Cookies.remove("refresh");

  queryClient.setQueryData<boolean>(
    buildKey(loginTokenVerifyFactory.queryKey, { queryClient }),
    false,
  );

  await queryClient.refetchQueries({
    // OK to call KEY.key() here as we are refetching all user-me queries.
    queryKey: userQueryKeys.meBase.key(),
  });
};

export const loginTokenVerify = async (): Promise<boolean> => {
  const accessToken = Cookies.get("access");
  if (accessToken === undefined) {
    return false;
  }
  try {
    await API.tokenVerifyCreate({
      tokenVerifyRequest: { token: accessToken },
    });
    return true;
  } catch {
    return false;
  }
};

/**
 * Checks whether the currently held JWT access token is still valid (by posting it to the verify endpoint),
 * hence whether or not the frontend still has logged-in access.
 * @returns true or false
 * Callers of this method should check this, before rendering their logged-in or un-logged-in versions.
 * If not logged in, then api calls will give 403s, this function will return false, and the website will tell you to log in anyways.
 */
export const loginCheck = async (
  queryClient: QueryClient,
): Promise<boolean> => {
  const verified = await loginTokenVerify();
  if (!verified) {
    await logout(queryClient);
  }
  return verified;
};
