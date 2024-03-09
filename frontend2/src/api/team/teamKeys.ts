import type {
  TeamTListRequest,
  TeamTMeRetrieveRequest,
  TeamTRetrieveRequest,
} from "../_autogen";
import type { QueryKeyBuilder } from "../apiTypes";
import { buildKey } from "../helpers";

type TeamRequest =
  | { episodeId: string; type: "base" }
  | (TeamTMeRetrieveRequest & { type: "me" })
  | (TeamTRetrieveRequest & { type: "other" })
  | (TeamTListRequest & { type: "list" });

// ---------- KEY RECORDS ---------- //
export const teamQueryKeys: Record<string, QueryKeyBuilder<TeamRequest>> = {
  teamBase: {
    key: ({ episodeId }: { episodeId: string }) => ["team", episodeId] as const,
    type: "callable",
  },

  myTeam: {
    key: ({ episodeId }: TeamTMeRetrieveRequest) =>
      [...buildKey(teamQueryKeys.teamBase, { episodeId }), "me"] as const,
    type: "callable",
  },

  // otherBase: ({ episodeId, id }: TeamTRetrieveRequest) =>
  //   ["team", id, { episodeId }] as const,
  otherBase: {
    key: ({ episodeId, id }: TeamTRetrieveRequest) =>
      [...buildKey(teamQueryKeys.teamBase({ episodeId })), id] as const,
    type: "callable",
  },

  // otherInfo: ({ episodeId, id }: TeamTRetrieveRequest) =>
  //   [...teamQueryKeys.otherBase({ episodeId, id }), "info"] as const,

  // search: ({ episodeId, search, page }: TeamTListRequest) =>
  //   ["team", "search", { episodeId, search, page }] as const,
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
