import type {
  CompeteMatchListRequest,
  CompeteMatchScrimmageListRequest,
  CompeteMatchTournamentListRequest,
  CompeteRequestInboxListRequest,
  CompeteRequestOutboxListRequest,
  CompeteSubmissionListRequest,
  CompeteSubmissionTournamentListRequest,
} from "../_autogen";

// ---------- KEY FACTORIES ---------- //
export const competeQueryKeys = {
  // --- SUBMISSIONS --- //
  subBase: ({ episodeId }: { episodeId: string }) =>
    ["compete", episodeId, "submissions"] as const,

  subList: ({ episodeId, page }: CompeteSubmissionListRequest) =>
    [...competeQueryKeys.subBase({ episodeId }), "list", page] as const,

  tourneySubs: ({ episodeId }: CompeteSubmissionTournamentListRequest) =>
    [...competeQueryKeys.subBase({ episodeId }), "tournament"] as const,

  // --- SCRIMMAGES --- //
  scrimBase: ({ episodeId }: { episodeId: string }) =>
    ["compete", episodeId, "scrimmages"] as const,

  inbox: ({ episodeId, page }: CompeteRequestInboxListRequest) =>
    [...competeQueryKeys.scrimBase({ episodeId }), "inbox", page] as const,

  outbox: ({ episodeId, page }: CompeteRequestOutboxListRequest) =>
    [...competeQueryKeys.scrimBase({ episodeId }), "outbox", page] as const,

  scrimsMeList: ({ episodeId, page }: CompeteMatchScrimmageListRequest) =>
    [...competeQueryKeys.scrimBase({ episodeId }), "list", "me", page] as const,

  scrimsOtherList: ({
    episodeId,
    teamId,
    page,
  }: CompeteMatchScrimmageListRequest) =>
    [
      ...competeQueryKeys.scrimBase({ episodeId }),
      "list",
      teamId,
      page,
    ] as const,

  // --- MATCHES --- //
  matchBase: ({ episodeId }: { episodeId: string }) =>
    ["compete", episodeId, "matches"] as const,

  matchList: ({ episodeId, page }: CompeteMatchListRequest) =>
    [...competeQueryKeys.matchBase({ episodeId }), "list", page] as const,

  tourneyMatchList: ({
    episodeId,
    teamId,
    tournamentId,
    roundId,
    page,
  }: CompeteMatchTournamentListRequest) =>
    [
      ...competeQueryKeys.matchBase({ episodeId }),
      "tournament",
      { tournamentId, roundId, teamId, page },
    ] as const,
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
