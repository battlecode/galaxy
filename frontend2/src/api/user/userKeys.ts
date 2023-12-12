import type {
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
  create: ({ episodeId }: { episodeId: string }) =>
    ["user", "create", episodeId] as const,

  updateCurrent: ({ episodeId }: { episodeId: string }) =>
    ["user", "update", episodeId] as const,

  resetPassword: ({ episodeId }: { episodeId: string }) =>
    ["user", "resetPass", episodeId] as const,

  avatarUpload: ({ episodeId }: { episodeId: string }) =>
    ["user", "avatar", episodeId] as const,

  resumeUpload: ({ episodeId }: { episodeId: string }) =>
    ["user", "resume", episodeId] as const,

  resumeDownload: ({ episodeId }: { episodeId: string }) =>
    ["user", "resume", episodeId, "download"] as const,
};
