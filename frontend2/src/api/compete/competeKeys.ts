import type {
  CompeteMatchListRequest,
  CompeteMatchScrimmageListRequest,
  CompeteMatchTournamentListRequest,
  CompeteRequestInboxListRequest,
  CompeteRequestOutboxListRequest,
  CompeteSubmissionListRequest,
  CompeteSubmissionTournamentListRequest,
} from "../_autogen";
import { QueryKeyBuilder } from "../apiTypes";
import { buildKey } from "../helpers";

type CompeteRequest =
  | CompeteMatchListRequest
  | CompeteMatchScrimmageListRequest
  | CompeteMatchTournamentListRequest
  | CompeteRequestInboxListRequest
  | CompeteRequestOutboxListRequest
  | CompeteSubmissionListRequest
  | CompeteSubmissionTournamentListRequest;

// ---------- KEY RECORDS ---------- //
export const competeQueryKeys: Record<
  string,
  QueryKeyBuilder<CompeteRequest>
> = {
  // --- SUBMISSIONS --- //
  subBase: {
    key: ({ episodeId }: { episodeId: string }) =>
      ["compete", episodeId, "submissions"] as const,
    type: "callable",
  },

  subList: {
    key: ({ episodeId, page = 1 }: CompeteSubmissionListRequest) =>
      [
        ...buildKey(competeQueryKeys.subBase, { episodeId }),
        "list",
        page,
      ] as const,
    type: "callable",
  },

  tourneySubs: {
    key: ({ episodeId }: CompeteSubmissionTournamentListRequest) =>
      [
        ...buildKey(competeQueryKeys.subBase, { episodeId }),
        "tournament",
      ] as const,
    type: "callable",
  },

  // --- SCRIMMAGES --- //
  scrimBase: {
    key: ({ episodeId }: { episodeId: string }) =>
      ["compete", episodeId, "scrimmages"] as const,
    type: "callable",
  },

  inbox: {
    key: ({ episodeId, page = 1 }: CompeteRequestInboxListRequest) =>
      [
        ...buildKey(competeQueryKeys.scrimBase, { episodeId }),
        "inbox",
        page,
      ] as const,
    type: "callable",
  },

  outbox: {
    key: ({ episodeId, page = 1 }: CompeteRequestOutboxListRequest) =>
      [
        ...buildKey(competeQueryKeys.scrimBase, { episodeId }),
        "outbox",
        page,
      ] as const,
    type: "callable",
  },

  scrimsMeList: {
    key: ({ episodeId, page = 1 }: CompeteMatchScrimmageListRequest) =>
      [
        ...buildKey(competeQueryKeys.scrimBase, { episodeId }),
        "list",
        "me",
        page,
      ] as const,
    type: "callable",
  },

  scrimsOtherList: {
    key: ({ episodeId, teamId, page = 1 }: CompeteMatchScrimmageListRequest) =>
      [
        ...buildKey(competeQueryKeys.scrimBase, { episodeId }),
        "list",
        teamId,
        (page = 1),
      ] as const,
    type: "callable",
  },

  // --- MATCHES --- //
  matchBase: {
    key: ({ episodeId }: { episodeId: string }) =>
      ["compete", episodeId, "matches"] as const,
    type: "callable",
  },

  matchList: {
    key: ({ episodeId, page = 1 }: CompeteMatchListRequest) =>
      [
        ...buildKey(competeQueryKeys.matchBase, { episodeId }),
        "list",
        page,
      ] as const,
    type: "callable",
  },

  tourneyMatchList: {
    key: ({
      episodeId,
      teamId,
      tournamentId,
      roundId,
      page = 1,
    }: CompeteMatchTournamentListRequest) =>
      [
        ...buildKey(competeQueryKeys.matchBase, { episodeId }),
        "tournament",
        { tournamentId, roundId, teamId, page },
      ] as const,
    type: "callable",
  },
};

export const competeMutationKeys = {
  // --- SUBMISSIONS --- //
  uploadSub: ({ episodeId }: { episodeId: string }) =>
    ["compete", episodeId, "submit"] as const,

  // --- SCRIMMAGES --- //
  requestScrim: ({ episodeId }: { episodeId: string }) =>
    ["compete", episodeId, "scrimmage", "request"] as const,

  acceptScrim: ({ episodeId }: { episodeId: string }) =>
    ["compete", episodeId, "scrimmage", "accept"] as const,

  rejectScrim: ({ episodeId }: { episodeId: string }) =>
    ["compete", episodeId, "scrimmage", "reject"] as const,

  cancelScrim: ({ episodeId }: { episodeId: string }) =>
    ["compete", episodeId, "scrimmage", "cancel"] as const,
};
