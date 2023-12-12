import type {
  TeamTListRequest,
  TeamTMeRetrieveRequest,
  TeamTRetrieveRequest,
} from "../_autogen";

export const teamQueryKeys = {
  myTeam: ({ episodeId }: TeamTMeRetrieveRequest) =>
    ["team", "me", { episodeId }] as const,

  otherBase: ({ episodeId, id }: TeamTRetrieveRequest) =>
    ["team", id, { episodeId }] as const,

  otherInfo: ({ episodeId, id }: TeamTRetrieveRequest) =>
    [...teamQueryKeys.otherBase({ episodeId, id }), "info"] as const,

  search: ({ episodeId, search, page }: TeamTListRequest) =>
    ["team", "search", { episodeId, search, page }] as const,
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

  avatar: ({ episodeId }: { episodeId: string }) =>
    ["team", "avatar", episodeId] as const,

  report: ({ episodeId }: { episodeId: string }) =>
    ["team", "report", episodeId] as const,
};
