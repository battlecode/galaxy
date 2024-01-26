import type {
  EpisodeEListRequest,
  EpisodeERetrieveRequest,
  EpisodeMapListRequest,
  EpisodeTournamentListRequest,
  EpisodeTournamentNextRetrieveRequest,
  EpisodeTournamentRetrieveRequest,
} from "../_autogen";

// ---------- QUERY KEYS ---------- //
export const episodeQueryKeys = {
  list: ({ page }: EpisodeEListRequest) =>
    ["episode", "list", { page }] as const,

  byId: ({ id }: { id: string }) => ["episode", { id }] as const,

  info: ({ id }: EpisodeERetrieveRequest) =>
    [...episodeQueryKeys.byId({ id }), "info"] as const,

  maps: ({ episodeId }: EpisodeMapListRequest) =>
    [...episodeQueryKeys.byId({ id: episodeId }), "maps"] as const,

  tournamentList: ({ episodeId, page }: EpisodeTournamentListRequest) =>
    [
      ...episodeQueryKeys.byId({ id: episodeId }),
      "tournamentList",
      { page },
    ] as const,

  nextTournament: ({ episodeId }: EpisodeTournamentNextRetrieveRequest) =>
    [...episodeQueryKeys.byId({ id: episodeId }), "nextTournament"] as const,

  tournamentInfo: ({ episodeId, id }: EpisodeTournamentRetrieveRequest) =>
    [
      ...episodeQueryKeys.byId({ id: episodeId }),
      "tournamentInfo",
      { id },
    ] as const,
};
