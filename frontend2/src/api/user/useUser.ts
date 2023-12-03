import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getUserProfileByUser,
  getUserUserProfile,
  updateUser,
} from "./userApi";
import { type PatchedUserPrivateRequest } from "../_autogen";

// ---------- KEY FACTORIES ----------//
export const userQueryKeys = {
  base: ["user"] as const,
  me: () => [...userQueryKeys.base, "private"] as const,
  public: (userId: number) =>
    [...userQueryKeys.base, "public", userId] as const,
  teams: (userId: number) => [...userQueryKeys.base, "teams", userId] as const,
};

export const userMutationKeys = {
  base: ["user"] as const,
  // TODO: this should stringify the user object (which is good???)
  // this should be double-checked
  update: (user: PatchedUserPrivateRequest) =>
    [...userMutationKeys.base, "update", user] as const,
};

// ---------- QUERY HOOKS ----------//
/**
 * For retrieving the currently logged in user's private profile.
 */
export const useCurrentUser = () =>
  useQuery({
    queryKey: userQueryKeys.me(),
    queryFn: getUserUserProfile,
  });

/**
 * For retrieving a user's public profile.
 */
export const useUserById = (userId: number) => {
  return useQuery({
    queryKey: userQueryKeys.public(userId),
    // TODO: confirm that this is correct!
    queryFn: () => getUserProfileByUser(userId),
  });
};

// ---------- MUTATION HOOKS ----------//
/**
 * For updating the currently logged in user's private profile.
 * If successful, updates the query cache's "current user" entry.
 */
export const useUpdateUser = (user: PatchedUserPrivateRequest) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: userMutationKeys.update(user),
    mutationFn: updateUser,
    onSuccess: (userData) => {
      queryClient.setQueryData(userQueryKeys.me(), userData);
    },
  });
};

// TODO: more mutations muahaha
