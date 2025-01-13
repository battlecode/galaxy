import type {
  EpisodeEListRequest,
  EpisodeERetrieveRequest,
  EpisodeMapListRequest,
  EpisodeTournamentInitializeCreateRequest,
  EpisodeTournamentListRequest,
  EpisodeTournamentNextRetrieveRequest,
  EpisodeTournamentRetrieveRequest,
  EpisodeTournamentRoundEnqueueCreateRequest,
  EpisodeTournamentRoundListRequest,
  EpisodeTournamentRoundReleaseCreateRequest,
  EpisodeTournamentRoundRetrieveRequest,
} from "../_autogen";
import type { QueryKeyBuilder } from "../apiTypes";

interface EpisodeKeys {
  list: QueryKeyBuilder<EpisodeEListRequest>;
  byId: QueryKeyBuilder<{ id: string }>;
  info: QueryKeyBuilder<EpisodeERetrieveRequest>;
  maps: QueryKeyBuilder<EpisodeMapListRequest>;
  tournamentList: QueryKeyBuilder<EpisodeTournamentListRequest>;
  nextTournament: QueryKeyBuilder<EpisodeTournamentNextRetrieveRequest>;
  tournamentBase: QueryKeyBuilder<{ episodeId: string; id: string }>;
  tournamentInfo: QueryKeyBuilder<EpisodeTournamentRetrieveRequest>;
  tournamentRoundInfo: QueryKeyBuilder<EpisodeTournamentRoundRetrieveRequest>;
  tournamentRoundList: QueryKeyBuilder<EpisodeTournamentRoundListRequest>;
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

  tournamentBase: {
    key: ({ episodeId, id }: { episodeId: string; id: string }) =>
      [
        ...episodeQueryKeys.byId.key({ id: episodeId }),
        "tournament",
        id,
      ] as const,
  },

  tournamentInfo: {
    key: ({ episodeId, id }: EpisodeTournamentRetrieveRequest) =>
      [
        ...episodeQueryKeys.tournamentBase.key({ episodeId, id }),
        "info",
        id,
      ] as const,
  },

  tournamentRoundInfo: {
    key: ({
      episodeId,
      tournament,
      id,
    }: EpisodeTournamentRoundRetrieveRequest) =>
      [
        ...episodeQueryKeys.tournamentBase.key({ episodeId, id: tournament }),
        "round",
        id,
      ] as const,
  },

  tournamentRoundList: {
    key: ({
      episodeId,
      tournament,
      page = 1,
    }: EpisodeTournamentRoundListRequest) =>
      [
        ...episodeQueryKeys.tournamentBase.key({ episodeId, id: tournament }),
        "round",
        "list",
        page,
      ] as const,
  },
};

// ---------- MUTATION KEYS ---------- //
export const episodeMutationKeys = {
  initializeTournament: ({
    episodeId,
    id,
  }: EpisodeTournamentInitializeCreateRequest) =>
    ["episode", episodeId, "tournament", id, "initialize"] as const,

  // We don't include the maps because they aren't relevant to the key
  createEnqueueTournamentRound: ({
    episodeId,
    tournament,
    id,
  }: EpisodeTournamentRoundEnqueueCreateRequest) =>
    [
      "episode",
      episodeId,
      "tournament",
      tournament,
      "round",
      id,
      "createEnqueue",
    ] as const,

  releaseTournamentRound: ({
    episodeId,
    tournament,
    id,
  }: EpisodeTournamentRoundReleaseCreateRequest) =>
    [
      "episode",
      episodeId,
      "tournament",
      tournament,
      "round",
      id,
      "release",
    ] as const,
};
