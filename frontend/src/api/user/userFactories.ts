import type { QueryClient } from "@tanstack/react-query";
import type { QueryFactory } from "../apiTypes";
import { userQueryKeys } from "./userKeys";
import { loginTokenVerify } from "../auth/authApi";
import type {
  ResetToken,
  TeamPublic,
  UserPasswordResetValidateTokenCreateRequest,
  UserPrivate,
  UserPublic,
  UserURetrieveRequest,
  UserUTeamsRetrieveRequest,
} from "../_autogen";
import {
  getCurrentUserInfo,
  getTeamsByUser,
  getUserInfoById,
  passwordResetTokenVerify,
} from "./userApi";
import toast from "react-hot-toast";

export const loginTokenVerifyFactory: QueryFactory<
  { queryClient: QueryClient },
  boolean
> = {
  queryKey: userQueryKeys.loginTokenVerify,
  queryFn: async () => await loginTokenVerify(),
} as const;

export const passwordResetTokenVerifyFactory: QueryFactory<
  UserPasswordResetValidateTokenCreateRequest,
  ResetToken
> = {
  queryKey: userQueryKeys.passwordResetTokenVerify,
  queryFn: async ({ resetTokenRequest }) => {
    const toastFn = async (): Promise<ResetToken> =>
      await passwordResetTokenVerify({ resetTokenRequest });
    return await toast.promise(toastFn(), {
      loading: "Verifying token...",
      success: "Token verified!",
      error: "Error verifying token. Is it expired?",
    });
  },
} as const;

export const myUserInfoFactory: QueryFactory<unknown, UserPrivate> = {
  queryKey: userQueryKeys.meBase,
  queryFn: async () => await getCurrentUserInfo(),
} as const;

export const otherUserInfoFactory: QueryFactory<
  UserURetrieveRequest,
  UserPublic
> = {
  queryKey: userQueryKeys.otherInfo,
  queryFn: async ({ id }: UserURetrieveRequest) =>
    await getUserInfoById({ id }),
} as const;

export const otherUserTeamsFactory: QueryFactory<
  UserUTeamsRetrieveRequest,
  Record<string, TeamPublic>
> = {
  queryKey: userQueryKeys.otherTeams,
  queryFn: async ({ id }: UserUTeamsRetrieveRequest) =>
    await getTeamsByUser({ id }),
} as const;
