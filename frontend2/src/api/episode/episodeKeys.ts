import type {
  EpisodeEListRequest,
  EpisodeERetrieveRequest,
  EpisodeMapListRequest,
  EpisodeTournamentListRequest,
  EpisodeTournamentNextRetrieveRequest,
  EpisodeTournamentRetrieveRequest,
} from "../_autogen";
import type { QueryKeyBuilder } from "../apiTypes";

interface EpisodeKeys {
  list: QueryKeyBuilder<EpisodeEListRequest>;
  byId: QueryKeyBuilder<{ id: string }>;
  info: QueryKeyBuilder<EpisodeERetrieveRequest>;
  maps: QueryKeyBuilder<EpisodeMapListRequest>;
  tournamentList: QueryKeyBuilder<EpisodeTournamentListRequest>;
  nextTournament: QueryKeyBuilder<EpisodeTournamentNextRetrieveRequest>;
  tournamentInfo: QueryKeyBuilder<EpisodeTournamentRetrieveRequest>;
}

// ---------- QUERY KEYS ---------- //
export const episodeQueryKeys: EpisodeKeys = {
  list: {
    key: ({ page = 1 }: EpisodeEListRequest) =>
      ["episode", "list", page] as const,
  },

  byId: {
    key: ({ id }: { id: string }) => ["episode", id] as const,
  },

  info: {
    key: ({ id }: EpisodeERetrieveRequest) =>
      [...episodeQueryKeys.byId.key({ id }), "info"] as const,
  },

  maps: {
    key: ({ episodeId }: EpisodeMapListRequest) =>
      [...episodeQueryKeys.byId.key({ id: episodeId }), "maps"] as const,
  },

  tournamentList: {
    key: ({ episodeId, page = 1 }: EpisodeTournamentListRequest) =>
      [
        ...episodeQueryKeys.byId.key({ id: episodeId }),
        "tournamentList",
        page,
      ] as const,
  },

  nextTournament: {
    key: ({ episodeId }: EpisodeTournamentNextRetrieveRequest) =>
      [
        ...episodeQueryKeys.byId.key({ id: episodeId }),
        "nextTournament",
      ] as const,
  },

  tournamentInfo: {
    key: ({ episodeId, id }: EpisodeTournamentRetrieveRequest) =>
      [
        ...episodeQueryKeys.byId.key({ id: episodeId }),
        "tournamentInfo",
        id,
      ] as const,
  },
};
