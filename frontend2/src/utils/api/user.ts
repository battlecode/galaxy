import { UserApi, type UserCreate, type UserCreateRequest } from "../types";
import { DEFAULT_API_CONFIGURATION } from "./constants";
import { login } from "./auth";

/** This file contains all frontend user api functions. */
const API = new UserApi(DEFAULT_API_CONFIGURATION);

/**
 * Register a new user.
 * @param user The user to register.
 */
export const register = async (
  user: UserCreateRequest,
): Promise<UserCreate> => {
  const returnedUser = await API.userUCreate({userCreateRequest: user});
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
  token: string,
): Promise<void> => {
  await API.userPasswordResetConfirmCreate({
    passwordTokenRequest: { password, token },
  });
};

/**
 * Request a password reset token to be sent to the provided email.
 */
export const forgotPassword = async (email: string): Promise<void> => {
  await API.userPasswordResetCreate({emailRequest: { email}});
};
