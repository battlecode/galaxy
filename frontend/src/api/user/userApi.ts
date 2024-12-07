import {
  UserApi,
  type UserPublic,
  type UserCreate,
  type UserPrivate,
  type TeamPublic,
  type UserUCreateRequest,
  type UserPasswordResetConfirmCreateRequest,
  type UserPasswordResetCreateRequest,
  type UserURetrieveRequest,
  type UserUTeamsRetrieveRequest,
  type UserUMePartialUpdateRequest,
  type UserUAvatarCreateRequest,
  type UserUResumeUpdateRequest,
  type UserPasswordResetValidateTokenCreateRequest,
  type ResetToken,
} from "../_autogen";
import { DEFAULT_API_CONFIGURATION, downloadFile } from "../helpers";

/** This file contains all frontend user api functions. */
const API = new UserApi(DEFAULT_API_CONFIGURATION);

/**
 * Register a new user, and logs the new user in (via access / refresh tokens)
 * @param userCreateRequest The user to register.
 * @returns The new user that was created.
 */
export const createUser = async ({
  userCreateRequest,
}: UserUCreateRequest): Promise<UserCreate> =>
  await API.userUCreate({ userCreateRequest });

/**
 * Verify that a password reset token is valid and not expired.
 * @param resetTokenRequest The password reset token to verify.
 */
export const passwordResetTokenVerify = async (
  resetTokenRequest: UserPasswordResetValidateTokenCreateRequest,
): Promise<ResetToken> =>
  await API.userPasswordResetValidateTokenCreate(resetTokenRequest);

/**
 * Confirm resetting a user's password.
 * @param passwordTokenRequest The new password and password reset token.
 */
export const doResetPassword = async ({
  passwordTokenRequest,
}: UserPasswordResetConfirmCreateRequest): Promise<void> => {
  await API.userPasswordResetConfirmCreate({
    passwordTokenRequest,
  });
};

/**
 * Request a password reset token to be sent to the provided email.
 * @param emailRequest The email to send the password reset token to.
 */
export const forgotPassword = async ({
  emailRequest,
}: UserPasswordResetCreateRequest): Promise<void> => {
  await API.userPasswordResetCreate({ emailRequest });
};

/**
 * Get a user's info.
 * @param id The user's ID.
 */
export const getUserInfoById = async ({
  id,
}: UserURetrieveRequest): Promise<UserPublic> =>
  await API.userURetrieve({ id });

/**
 * Get the currently logged in user's info.
 */
export const getCurrentUserInfo = async (): Promise<UserPrivate> =>
  await API.userUMeRetrieve();

/**
 * Get all teams associated with a user.
 * @param id The user's ID.
 */
export const getTeamsByUser = async ({
  id,
}: UserUTeamsRetrieveRequest): Promise<Record<string, TeamPublic>> =>
  await API.userUTeamsRetrieve({ id });

/**
 * Update the currently logged in user's info.
 * @param patchedUserPrivateRequest The PARTIAL user update.
 */
export const updateCurrentUser = async ({
  patchedUserPrivateRequest,
}: UserUMePartialUpdateRequest): Promise<UserPrivate> =>
  await API.userUMePartialUpdate({ patchedUserPrivateRequest });

/**
 * Upload a new avatar for the currently logged in user.
 * @param userAvatarRequest The avatar file.
 */
export const userAvatarUpload = async (
  userAvatarRequest: UserUAvatarCreateRequest,
): Promise<void> => {
  await API.userUAvatarCreate(userAvatarRequest);
};

/**
 * Upload a resume for the currently logged in user.
 * @param userResumeRequest The resume file.
 */
export const resumeUpload = async (
  userResumeRequest: UserUResumeUpdateRequest,
): Promise<void> => {
  await API.userUResumeUpdate(userResumeRequest);
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
