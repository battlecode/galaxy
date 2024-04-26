import type {
  UserURetrieveRequest,
  UserUTeamsRetrieveRequest,
} from "../_autogen";
import type { QueryKeyBuilder, QueryKeyHolder } from "../apiTypes";

interface UserKeys {
  tokenVerify: QueryKeyHolder;
  meBase: QueryKeyHolder;
  myInfo: QueryKeyHolder;
  otherBase: QueryKeyBuilder<UserURetrieveRequest>;
  otherInfo: QueryKeyBuilder<UserURetrieveRequest>;
  otherTeams: QueryKeyBuilder<UserUTeamsRetrieveRequest>;
}

// ---------- KEY FACTORIES ----------//
export const userQueryKeys: UserKeys = {
  meBase: {
    key: () => ["user", "me"] as const,
  },

  tokenVerify: {
    key: () => [...userQueryKeys.meBase.key(), "tokenVerify"] as const,
  },

  myInfo: {
    key: () => [...userQueryKeys.meBase.key(), "myInfo"] as const,
  },

  otherBase: {
    key: ({ id }: UserURetrieveRequest) => ["user", id] as const,
  },

  otherInfo: {
    key: ({ id }: UserURetrieveRequest) =>
      [...userQueryKeys.otherBase.key({ id }), "info"] as const,
  },

  otherTeams: {
    key: ({ id }: UserUTeamsRetrieveRequest) =>
      [...userQueryKeys.otherBase.key({ id }), "teams"] as const,
  },
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
