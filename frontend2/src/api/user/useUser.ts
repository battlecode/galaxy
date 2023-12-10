import {
  type UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import type {
  UserPrivate,
  UserPublic,
  UserURetrieveRequest,
  UserUTeamsRetrieveRequest,
  TeamPublic,
  UserUCreateRequest,
  UserUMePartialUpdateRequest,
  UserCreate,
  UserPasswordResetConfirmCreateRequest,
  UserUAvatarCreateRequest,
  UserUResumeUpdateRequest,
} from "../_autogen";
import { userMutationKeys, userQueryKeys } from "./userKeys";
import {
  avatarUpload,
  createUser,
  doResetPassword,
  getCurrentUserInfo,
  getTeamsByUser,
  getUserInfoById,
  resumeUpload,
  updateCurrentUser,
} from "./userApi";
import { toast } from "react-hot-toast";
import { login } from "../auth/authApi";

// ---------- QUERY HOOKS ----------//
/**
 * For retrieving the currently logged in user's info.
 */
export const useCurrentUserInfo = (): UseQueryResult<UserPrivate, Error> =>
  useQuery({
    queryKey: userQueryKeys.meBase,
    queryFn: async () => await getCurrentUserInfo(),
  });

/**
 * For retrieving a user's info.
 */
export const useUserInfoById = ({
  id,
}: UserURetrieveRequest): UseQueryResult<UserPublic, Error> =>
  useQuery({
    queryKey: userQueryKeys.otherInfo({ id }),
    queryFn: async () => await getUserInfoById({ id }),
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
    queryKey: userQueryKeys.otherTeams({ id }),
    queryFn: async () => await getTeamsByUser({ id }),
  });

// ---------- MUTATION HOOKS ----------//
/**
 * For creating a new user. If successful, logs in the new user.
 */
export const useCreateUser = ({
  userCreateRequest,
}: UserUCreateRequest): UseMutationResult<UserCreate, Error, void, unknown> =>
  useMutation({
    mutationKey: userMutationKeys.create({ userCreateRequest }),
    mutationFn: async () =>
      await toast.promise(createUser({ userCreateRequest }), {
        loading: "Creating new user...",
        success: (user) => `Created new user ${user.username}!`,
        error: "Error creating user.",
      }),
    onSuccess: async () => {
      const queryClient = useQueryClient();
      // Log in this new user.
      await login(userCreateRequest.username, userCreateRequest.password);
      // Refetch the current user's info.
      await queryClient.refetchQueries({ queryKey: userQueryKeys.meBase });
    },
  });

/**
 * For updating the currently logged in user's info.
 */
export const useUpdateCurrentUserInfo = ({
  patchedUserPrivateRequest,
}: UserUMePartialUpdateRequest): UseMutationResult<
  UserPrivate,
  Error,
  void,
  unknown
> =>
  useMutation({
    mutationKey: userMutationKeys.updateCurrent({ patchedUserPrivateRequest }),
    mutationFn: async () =>
      await toast.promise(updateCurrentUser({ patchedUserPrivateRequest }), {
        loading: "Updating user info...",
        success: "Updated user info!",
        error: "Error updating user info.",
      }),
    onSuccess: async (data) => {
      const queryClient = useQueryClient();
      await queryClient.setQueryData(userQueryKeys.meBase, data);
    },
  });

/**
 * For resetting a user's password. If successful, logs in the user.
 */
export const useResetPassword = ({
  passwordTokenRequest,
}: UserPasswordResetConfirmCreateRequest): UseMutationResult<
  void,
  Error,
  void,
  unknown
> =>
  useMutation({
    mutationKey: userMutationKeys.resetPassword({ passwordTokenRequest }),
    mutationFn: async () => {
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
export const useAvatarUpload = ({
  userAvatarRequest,
}: UserUAvatarCreateRequest): UseMutationResult<void, Error, void, unknown> =>
  useMutation({
    mutationKey: userMutationKeys.avatarUpload({ userAvatarRequest }),
    mutationFn: async () => {
      await toast.promise(avatarUpload({ userAvatarRequest }), {
        loading: "Uploading new avatar...",
        success: "Uploaded new avatar!",
        error: "Error uploading new avatar.",
      });
    },
    onSuccess: async () => {
      const queryClient = useQueryClient();
      // Refetch the current user's info.
      await queryClient.refetchQueries({ queryKey: userQueryKeys.meBase });
    },
  });

/**
 * For uploading a new resume for the currently logged in user.
 */
export const useResumeUpload = ({
  userResumeRequest,
}: UserUResumeUpdateRequest): UseMutationResult<void, Error, void, unknown> =>
  useMutation({
    mutationKey: userMutationKeys.resumeUpload({ userResumeRequest }),
    mutationFn: async () => {
      await toast.promise(resumeUpload({ userResumeRequest }), {
        loading: "Uploading new resume...",
        success: "Uploaded new resume!",
        error: "Error uploading new resume.",
      });
    },
    onSuccess: async () => {
      const queryClient = useQueryClient();
      // Refetch the current user's info.
      await queryClient.refetchQueries({ queryKey: userQueryKeys.meBase });
    },
  });
