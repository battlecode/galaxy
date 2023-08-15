import * as Api from "./api";
import Cookies from "js-cookie";
import type * as models from "./types/model/models";
import { ApiApi } from "./types/api/ApiApi";
import type * as customModels from "./apiTypes";

/** This file contains all frontend authentication functions. Responsible for interacting with Cookies and expiring/setting JWT tokens. */

// hacky, fall back to localhost for now
const baseUrl = process.env.REACT_APP_BACKEND_URL ?? "http://localhost:8000";

// This is an instance of the auto-generated API class.
// The "ApiApi" class should not be imported/used anywhere but this file and auth.ts!
const API = new ApiApi(baseUrl);

/**
 * Clear the access and refresh tokens from the browser's cookies.
 */
export const logout = (): void => {
  Cookies.set("access", "");
  Cookies.set("refresh", "");
  setLoginHeader();
  window.location.replace("/");
};

/**
 * Set the access and refresh tokens in the browser's cookies.
 * @param username The username of the user.
 * @param password The password of the user.
 */
export const login = async (
  username: string,
  password: string
): Promise<void> => {
  const credentials = {
    username,
    password,
    access: "",
    refresh: "",
  };

  const res = await Api.getApiTokens(credentials);

  Cookies.set("access", res.access);
  Cookies.set("refresh", res.refresh);
};

/**
 * Set authorization header based on the current cookie state, which is provided by
 * default for all subsequent requests. The header is a JWT token: see
 * https://django-rest-framework-simplejwt.readthedocs.io/en/latest/getting_started.html
 */
export const setLoginHeader = (): void => {
  const accessToken = Cookies.get("access");
  if (accessToken !== undefined) {
    $.ajaxSetup({
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  }
};

/**
 * Checks whether the currently held JWT access token is still valid (by posting it to the verify endpoint),
 * hence whether or not the frontend still has logged-in access.
 * @returns true or false
 * Callers of this method should check this, before rendering their logged-in or un-logged-in versions.
 * If not logged in, then api calls will give 403s, and the website will tell you to log in anyways.
 */
export const loginCheck = async (): Promise<boolean> => {
  return await Api.verifyCurrentToken();
};

/**
 * Register a new user.
 * @param user The user to register.
 */
export const register = async (
  user: customModels.CreateUserInput
): Promise<models.UserCreate> => {
  const returnedUser = await Api.createUser(user);
  await login(user.username, user.password);
  return returnedUser;
};

/**
 * Confirm resetting a user's password.
 * @param password The new password.
 * @param token The password reset token.
 */
export const doResetPassword = async (
  password: string,
  token: string
): Promise<void> => {
  await API.apiUserPasswordResetConfirmCreate({ password, token });
};

/**
 * Request a password reset token to be sent to the provided email.
 */
export const forgotPassword = async (email: string): Promise<void> => {
  await API.apiUserPasswordResetCreate({ email });
};
