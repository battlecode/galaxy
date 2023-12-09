import type {
  UserPasswordResetConfirmCreateRequest,
  UserUAvatarCreateRequest,
  UserUCreateRequest,
  UserUMePartialUpdateRequest,
  UserUResumeUpdateRequest,
  UserURetrieveRequest,
  UserUTeamsRetrieveRequest,
} from "../_autogen";

// ---------- KEY FACTORIES ----------//
export const userQueryKeys = {
  meBase: ["user", "me"] as const,

  myInfo: () => [...userQueryKeys.meBase, "info"] as const,

  otherBase: ({ id }: UserURetrieveRequest) => ["user", { id }] as const,

  otherInfo: ({ id }: UserURetrieveRequest) =>
    [...userQueryKeys.otherBase({ id }), "info"] as const,

  otherTeams: ({ id }: UserUTeamsRetrieveRequest) =>
    [...userQueryKeys.otherBase({ id }), "teams"] as const,
};

export const userMutationKeys = {
  create: ({ userCreateRequest }: UserUCreateRequest) =>
    ["user", "create", { userCreateRequest }] as const,

  updateCurrent: ({ patchedUserPrivateRequest }: UserUMePartialUpdateRequest) =>
    ["user", "update", { patchedUserPrivateRequest }] as const,

  resetPassword: ({
    passwordTokenRequest,
  }: UserPasswordResetConfirmCreateRequest) =>
    ["user", "resetPass", { passwordTokenRequest }] as const,

  avatarUpload: ({ userAvatarRequest }: UserUAvatarCreateRequest) =>
    ["user", "avatar", { userAvatarRequest }] as const,

  resumeUpload: ({ userResumeRequest }: UserUResumeUpdateRequest) =>
    ["user", "resume", { userResumeRequest }] as const,

  resumeDownload: () => ["user", "resume", "download"] as const,
};
