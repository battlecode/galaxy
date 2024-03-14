import {
  type UseQueryResult,
  useMutation,
  useQuery,
  type UseMutationResult,
  type QueryClient,
} from "@tanstack/react-query";
import type {
  UserPrivate,
  UserPublic,
  UserURetrieveRequest,
  UserUTeamsRetrieveRequest,
  TeamPublic,
  UserUCreateRequest,
  UserUMePartialUpdateRequest,
  UserPasswordResetConfirmCreateRequest,
  UserUAvatarCreateRequest,
  UserUResumeUpdateRequest,
} from "../_autogen";
import { userMutationKeys, userQueryKeys } from "./userKeys";
import {
  avatarUpload,
  createUser,
  doResetPassword,
  resumeUpload,
  updateCurrentUser,
} from "./userApi";
import { toast } from "react-hot-toast";
import { login } from "../auth/authApi";
import {
  myUserInfoFactory,
  otherUserInfoFactory,
  otherUserTeamsFactory,
  tokenVerifyFactory,
} from "./userFactories";
import { buildKey } from "../helpers";

// ---------- QUERY HOOKS ----------//
/**
 * For checking if a user is logged in.
 */
export const useIsLoggedIn = (
  queryClient: QueryClient,
): UseQueryResult<boolean, Error> =>
  useQuery({
    queryKey: buildKey(tokenVerifyFactory.queryKey, { queryClient }),
    queryFn: async () => await tokenVerifyFactory.queryFn({ queryClient }),
    staleTime: Infinity,
  });

/**
 * For retrieving the currently logged in user's info.
 */
export const useCurrentUserInfo = (): UseQueryResult<UserPrivate, Error> =>
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
}: UserURetrieveRequest): UseQueryResult<UserPublic, Error> =>
  useQuery({
    queryKey: buildKey(otherUserInfoFactory.queryKey, { id }),
    queryFn: async () => await otherUserInfoFactory.queryFn({ id }),
  });

/**
 * Get the teams associated with a user.
 */
export const useTeamsByUser = ({
  id,
}: UserUTeamsRetrieveRequest): UseQueryResult<
  Record<string, TeamPublic>,
  Error
> =>
  useQuery({
    // queryKey: userQueryKeys.otherTeams({ id }),
    // queryFn: async () => await getTeamsByUser({ id }),
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
): UseMutationResult<void, Error, UserUCreateRequest, unknown> =>
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
        error: "Error creating user.",
      });
    },
  });

/**
 * For updating the currently logged in user's info.
 */
export const useUpdateCurrentUserInfo = (
  { episodeId }: { episodeId: string },
  queryClient: QueryClient,
): UseMutationResult<
  UserPrivate,
  Error,
  UserUMePartialUpdateRequest,
  unknown
> =>
  useMutation({
    mutationKey: userMutationKeys.updateCurrent({ episodeId }),
    mutationFn: async ({
      patchedUserPrivateRequest,
    }: UserUMePartialUpdateRequest) => {
      return await toast.promise(
        updateCurrentUser({ patchedUserPrivateRequest }),
        {
          loading: "Updating user info...",
          success: "Updated user info!",
          error: "Error updating user info.",
        },
      );
    },
    onSuccess: async (data) => {
      await queryClient.setQueryData(
        buildKey(myUserInfoFactory.queryKey, { episodeId }),
        data,
      );
    },
  });

/**
 * For resetting a user's password. If successful, logs in the user.
 */
export const useResetPassword = ({
  episodeId,
}: {
  episodeId: string;
}): UseMutationResult<
  void,
  Error,
  UserPasswordResetConfirmCreateRequest,
  unknown
> =>
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
    },
  });

/**
 * For uploading a new avatar for the currently logged in user.
 */
export const useAvatarUpload = (
  { episodeId }: { episodeId: string },
  queryClient: QueryClient,
): UseMutationResult<void, Error, UserUAvatarCreateRequest, unknown> =>
  useMutation({
    mutationKey: userMutationKeys.avatarUpload({ episodeId }),
    mutationFn: async (userAvatarRequest: UserUAvatarCreateRequest) => {
      await toast.promise(avatarUpload(userAvatarRequest), {
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
): UseMutationResult<void, Error, UserUResumeUpdateRequest, unknown> =>
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
