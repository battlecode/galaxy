import type { QueryClient } from "@tanstack/react-query";
import type { QueryFactory } from "../apiTypes";
import { userQueryKeys } from "./userKeys";
import { loginCheck } from "../auth/authApi";
import type {
  TeamPublic,
  UserPrivate,
  UserPublic,
  UserURetrieveRequest,
  UserUTeamsRetrieveRequest,
} from "../_autogen";
import { getCurrentUserInfo, getTeamsByUser, getUserInfoById } from "./userApi";

export const tokenVerifyFactory: QueryFactory<
  { queryClient: QueryClient },
  boolean
> = {
  queryKey: userQueryKeys.tokenVerify,
  queryFn: async ({ queryClient }) => await loginCheck(queryClient),
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
