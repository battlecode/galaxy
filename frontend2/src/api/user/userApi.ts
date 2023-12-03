import {
  UserApi,
  type UserPublic,
  type UserCreate,
  type UserCreateRequest,
  type UserPrivate,
  type TeamPublic,
  type PatchedUserPrivateRequest,
  type UserAvatarRequest,
} from "../_autogen";
import { DEFAULT_API_CONFIGURATION, downloadFile } from "../helpers";
import { login } from "../auth/authApi";

/** This file contains all frontend user api functions. */
const API = new UserApi(DEFAULT_API_CONFIGURATION);

/**
 * Register a new user, and logs the new user in (via access / refresh tokens)
 * @param user The user to register.
 * @returns The new user that was created.
 */
export const createUser = async (
  user: UserCreateRequest,
): Promise<UserCreate> => {
  const returnedUser = await API.userUCreate({ userCreateRequest: user });
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
  await API.userPasswordResetCreate({ emailRequest: { email } });
};

/**
 * Get a user's profile.
 * @param userId The user's ID.
 */
export const getUserProfileByUser = async (
  userId: number,
): Promise<UserPublic> => {
  return await API.userURetrieve({ id: userId });
};

/**
 * Get the currently logged in user's profile.
 */
export const getUserUserProfile = async (): Promise<UserPrivate> => {
  return await API.userUMeRetrieve();
};

/**
 * Get all teams associated with a user.
 * @param userId The user's ID.
 */
export const getTeamsByUser = async (
  userId: number,
): Promise<Record<string, TeamPublic>> => {
  return await API.userUTeamsRetrieve({ id: userId });
};

/**
 * Update the currently logged in user's info.
 */
export const updateUser = async (
  user: PatchedUserPrivateRequest,
): Promise<UserPrivate> => {
  return await API.userUMePartialUpdate({ patchedUserPrivateRequest: user });
};

/**
 * Upload a new avatar for the currently logged in user.
 * @param avatarFile The avatar file.
 */
export const avatarUpload = async (avatarFile: File): Promise<void> => {
  const userAvatarRequest: UserAvatarRequest = {
    avatar: avatarFile,
  };
  await API.userUAvatarCreate({ userAvatarRequest });
};

/**
 * Upload a resume for the currently logged in user.
 * @param resumeFile The resume file.
 */
export const resumeUpload = async (resumeFile: File): Promise<void> => {
  await API.userUResumeUpdate({ userResumeRequest: { resume: resumeFile } });
};

/**
 * Download the resume of the currently logged in user.
 */
export const downloadResume = async (): Promise<void> => {
  const { ready, url, reason } = await API.userUResumeRetrieve();
  if (!ready) {
    throw new Error(`Error downloading the resume: ${reason}`);
  }
  await downloadFile(url, "resume.pdf");
};
