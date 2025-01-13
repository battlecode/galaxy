import type {
  TeamTListRequest,
  TeamTMeRetrieveRequest,
  TeamTRetrieveRequest,
} from "../_autogen";
import type { QueryKeyBuilder } from "../apiTypes";

interface TeamKeys {
  teamBase: QueryKeyBuilder<{ episodeId: string }>;
  myTeam: QueryKeyBuilder<TeamTMeRetrieveRequest>;
  otherBase: QueryKeyBuilder<TeamTRetrieveRequest>;
  otherInfo: QueryKeyBuilder<TeamTRetrieveRequest>;
  search: QueryKeyBuilder<TeamTListRequest>;
}

// ---------- KEY RECORDS ---------- //
export const teamQueryKeys: TeamKeys = {
  teamBase: {
    key: ({ episodeId }: { episodeId: string }) => ["team", episodeId] as const,
  },

  myTeam: {
    key: ({ episodeId }: TeamTMeRetrieveRequest) =>
      [...teamQueryKeys.teamBase.key({ episodeId }), "me"] as const,
  },

  otherBase: {
    key: ({ episodeId, id }: TeamTRetrieveRequest) =>
      [...teamQueryKeys.teamBase.key({ episodeId }), id] as const,
  },

  otherInfo: {
    key: ({ episodeId, id }: TeamTRetrieveRequest) =>
      [...teamQueryKeys.otherBase.key({ episodeId, id }), "info"] as const,
  },

  search: {
    key: ({
      episodeId,
      search = "",
      hasActiveSubmission = false,
      eligibleFor = [],
      page = 1,
    }: TeamTListRequest) =>
      [
        ...teamQueryKeys.teamBase.key({ episodeId }),
        "search",
        search,
        hasActiveSubmission,
        eligibleFor,
        page,
      ] as const,
    // ["team", "search", { episodeId, search, page }] as const,
  },
};

export const teamMutationKeys = {
  create: ({ episodeId }: { episodeId: string }) =>
    ["team", "create", episodeId] as const,

  join: ({ episodeId }: { episodeId: string }) =>
    ["team", "join", episodeId] as const,

  leave: ({ episodeId }: { episodeId: string }) =>
    ["team", "leave", episodeId] as const,

  update: ({ episodeId }: { episodeId: string }) =>
    ["team", "update", episodeId] as const,

  avatarUpload: ({ episodeId }: { episodeId: string }) =>
    ["team", "avatar", episodeId] as const,

  report: ({ episodeId }: { episodeId: string }) =>
    ["team", "report", episodeId] as const,
};
