import {
  type UseQueryResult,
  useMutation,
  useQuery,
  type UseMutationResult,
  type QueryClient,
} from "@tanstack/react-query";
import {
  type UserPrivate,
  type UserPublic,
  type UserURetrieveRequest,
  type UserUTeamsRetrieveRequest,
  type TeamPublic,
  type UserUCreateRequest,
  type UserUMePartialUpdateRequest,
  type UserPasswordResetConfirmCreateRequest,
  type UserUAvatarCreateRequest,
  type UserUResumeUpdateRequest,
  type UserPasswordResetValidateTokenCreateRequest,
  type ResetToken,
  ResponseError,
} from "../_autogen";
import { userMutationKeys, userQueryKeys } from "./userKeys";
import {
  createUser,
  doResetPassword,
  forgotPassword,
  resumeUpload,
  updateCurrentUser,
  downloadResume,
  userAvatarUpload,
} from "./userApi";
import { toast } from "react-hot-toast";
import { login } from "../auth/authApi";
import {
  myUserInfoFactory,
  otherUserInfoFactory,
  otherUserTeamsFactory,
  loginTokenVerifyFactory,
  passwordResetTokenVerifyFactory,
} from "./userFactories";
import { buildKey } from "../helpers";

// ---------- QUERY HOOKS ----------//
/**
 * For checking if a user is logged in.
 */
export const useIsLoggedIn = (
  queryClient: QueryClient,
): UseQueryResult<boolean> =>
  useQuery({
    queryKey: buildKey(loginTokenVerifyFactory.queryKey, { queryClient }),
    queryFn: async () => await loginTokenVerifyFactory.queryFn({ queryClient }),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

export const usePasswordResetTokenValid = ({
  resetTokenRequest,
}: UserPasswordResetValidateTokenCreateRequest): UseQueryResult<ResetToken> =>
  useQuery({
    queryKey: buildKey(passwordResetTokenVerifyFactory.queryKey, {
      resetTokenRequest,
    }),
    queryFn: async () =>
      await passwordResetTokenVerifyFactory.queryFn({ resetTokenRequest }),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

/**
 * For retrieving the currently logged in user's info.
 */
export const useCurrentUserInfo = (): UseQueryResult<UserPrivate> =>
  useQuery({
    // These empty objects are necessary to make the generic typing work :p
    queryKey: buildKey(myUserInfoFactory.queryKey, {}),
    queryFn: async () => await myUserInfoFactory.queryFn({}),
  });

/**
 * For retrieving a user's info.
 */
export const useUserInfoById = ({
  id,
}: UserURetrieveRequest): UseQueryResult<UserPublic> =>
  useQuery({
    queryKey: buildKey(otherUserInfoFactory.queryKey, { id }),
    queryFn: async () => await otherUserInfoFactory.queryFn({ id }),
  });

/**
 * Get the teams associated with a user.
 */
export const useTeamsByUser = ({
  id,
}: UserUTeamsRetrieveRequest): UseQueryResult<Record<string, TeamPublic>> =>
  useQuery({
    queryKey: buildKey(otherUserTeamsFactory.queryKey, { id }),
    queryFn: async () => await otherUserTeamsFactory.queryFn({ id }),
  });

// ---------- MUTATION HOOKS ----------//
/**
 * For creating a new user. If successful, logs in the new user.
 */
export const useCreateUser = (
  { episodeId }: { episodeId: string },
  queryClient: QueryClient,
): UseMutationResult<void, Error, UserUCreateRequest> =>
  useMutation({
    mutationKey: userMutationKeys.create({ episodeId }),
    mutationFn: async ({ userCreateRequest }: UserUCreateRequest) => {
      const toastFn = async (): Promise<void> => {
        try {
          await createUser({ userCreateRequest });
          await login(
            userCreateRequest.username,
            userCreateRequest.password,
            queryClient,
          );
        } catch (err) {
          if (err instanceof ResponseError) {
            const errBody = (await err.response.json()) as {
              email?: string;
              username?: string;
            };
            if (errBody.username !== undefined) {
              throw Error(errBody.username);
            } else if (errBody.email !== undefined) {
              throw Error(errBody.email);
            }
          }
          throw err as Error;
        } finally {
          await queryClient.refetchQueries({
            // OK to call KEY.key() here as we are refetching all user-me queries.
            queryKey: userQueryKeys.meBase.key(),
          });
        }
      };
      await toast.promise(toastFn(), {
        loading: "Creating new user...",
        success: "Created new user!",
        error: (err) => {
          if (err instanceof Error) {
            return err.message;
          }
          return "Error creating user.";
        },
      });
    },
  });

/**
 * For updating the currently logged in user's info.
 */
export const useUpdateCurrentUserInfo = (
  { episodeId }: { episodeId: string },
  queryClient: QueryClient,
): UseMutationResult<UserPrivate, Error, UserUMePartialUpdateRequest> =>
  useMutation({
    mutationKey: userMutationKeys.updateCurrent({ episodeId }),
    mutationFn: async ({
      patchedUserPrivateRequest,
    }: UserUMePartialUpdateRequest) =>
      await toast.promise(updateCurrentUser({ patchedUserPrivateRequest }), {
        loading: "Updating user info...",
        success: "Updated user info!",
        error: "Error updating user info.",
      }),
    onSuccess: async (data) => {
      await queryClient.setQueryData(
        buildKey(myUserInfoFactory.queryKey, { episodeId }),
        data,
      );
    },
  });

/**
 * For requesting a password reset token to be sent to the provided email. If successful, sends an email.
 */
export const useForgotPassword = ({
  episodeId,
}: {
  episodeId: string;
}): UseMutationResult<void, Error, string> =>
  useMutation({
    mutationKey: userMutationKeys.forgotPassword({ episodeId }),
    mutationFn: async (email: string) => {
      await toast.promise(forgotPassword({ emailRequest: { email } }), {
        loading: "Sending password reset email...",
        success:
          "Sent password reset email!\nWait a few minutes for it to arrive.",
        error:
          "Error sending password reset email.\nDid you enter the correct email?",
      });
    },
  });

/**
 * For resetting a user's password. If successful, navigates to the login page.
 */
export const useResetPassword = ({
  episodeId,
}: {
  episodeId: string;
}): UseMutationResult<void, Error, UserPasswordResetConfirmCreateRequest> =>
  useMutation({
    mutationKey: userMutationKeys.resetPassword({ episodeId }),
    mutationFn: async ({
      passwordTokenRequest,
    }: UserPasswordResetConfirmCreateRequest) => {
      await toast.promise(doResetPassword({ passwordTokenRequest }), {
        loading: "Resetting password...",
        success: "Reset password!",
        error: "Error resetting password.",
      });
      window.location.href = "/login";
    },
  });

/**
 * For uploading a new avatar for the currently logged in user.
 */
export const useUpdateUserAvatar = (
  { episodeId }: { episodeId: string },
  queryClient: QueryClient,
): UseMutationResult<void, Error, UserUAvatarCreateRequest> =>
  useMutation({
    mutationKey: userMutationKeys.avatarUpload({ episodeId }),
    mutationFn: async (userAvatarRequest: UserUAvatarCreateRequest) => {
      await toast.promise(userAvatarUpload(userAvatarRequest), {
        loading: "Uploading new avatar...",
        success: "Uploaded new avatar!",
        error: "Error uploading new avatar.",
      });
    },
    onSuccess: async () => {
      // Refetch the current user's info.
      await queryClient.refetchQueries({
        queryKey: buildKey(myUserInfoFactory.queryKey, { episodeId }),
      });
    },
  });

/**
 * For uploading a new resume for the currently logged in user.
 */
export const useResumeUpload = (
  { episodeId }: { episodeId: string },
  queryClient: QueryClient,
): UseMutationResult<void, Error, UserUResumeUpdateRequest> =>
  useMutation({
    mutationKey: userMutationKeys.resumeUpload({ episodeId }),
    mutationFn: async (userResumeRequest: UserUResumeUpdateRequest) => {
      await toast.promise(resumeUpload(userResumeRequest), {
        loading: "Uploading new resume...",
        success: "Uploaded new resume!",
        error: "Error uploading new resume.",
      });
    },
    onSuccess: async () => {
      // Refetch the current user's info.
      await queryClient.refetchQueries({
        queryKey: buildKey(myUserInfoFactory.queryKey, { episodeId }),
      });
    },
  });

/**
 * For downloading the resume of the currently logged in user.
 */
export const useDownloadResume = ({
  episodeId,
}: {
  episodeId: string;
}): UseMutationResult<void, Error, UserURetrieveRequest> =>
  useMutation({
    mutationKey: userMutationKeys.resumeDownload({ episodeId }),
    mutationFn: async () => {
      await toast.promise(downloadResume(), {
        loading: "Downloading resume...",
        success: "Downloaded resume!",
        error: "Error downloading resume.",
      });
    },
  });
