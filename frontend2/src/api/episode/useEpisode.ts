import { type UseQueryResult, useQuery } from "@tanstack/react-query";
import {
  getEpisodeInfo,
  getEpisodeList,
  getEpisodeMaps,
  getNextTournament,
  getTournamentInfo,
  getTournamentList,
} from "./episodeApi";
import { episodeQueryKeys } from "./episodeKeys";
import type {
  Episode,
  EpisodeEListRequest,
  EpisodeERetrieveRequest,
  EpisodeMapListRequest,
  EpisodeTournamentListRequest,
  EpisodeTournamentNextRetrieveRequest,
  EpisodeTournamentRetrieveRequest,
  GameMap,
  PaginatedEpisodeList,
  PaginatedTournamentList,
  Tournament,
} from "../_autogen";

// ---------- QUERY HOOKS ---------- //
/**
 * For retrieving the given episode's info.
 */
export const useEpisodeInfo = ({
  id,
}: EpisodeERetrieveRequest): UseQueryResult<Episode, Error> =>
  useQuery({
    queryKey: episodeQueryKeys.info({ id }),
    queryFn: async () => await getEpisodeInfo({ id }),
    staleTime: 5 * 1000 * 60, // 5 minutes
  });

/**
 * For retrieving a paginated list of Battlecode episodes.
 */
export const useEpisodeList = ({
  page,
}: EpisodeEListRequest): UseQueryResult<PaginatedEpisodeList, Error> =>
  useQuery({
    queryKey: episodeQueryKeys.list({ page }),
    queryFn: async () => await getEpisodeList({ page }),
  });

/**
 * For retrieving the maps of the given episode.
 */
export const useEpisodeMaps = ({
  episodeId,
}: EpisodeMapListRequest): UseQueryResult<GameMap[], Error> =>
  useQuery({
    queryKey: episodeQueryKeys.maps({ episodeId }),
    queryFn: async () => await getEpisodeMaps({ episodeId }),
  });

/**
 * For retrieving the next tournament occurring during the given episode.
 */
export const useNextTournament = ({
  episodeId,
}: EpisodeTournamentNextRetrieveRequest): UseQueryResult<Tournament, Error> =>
  useQuery({
    queryKey: episodeQueryKeys.nextTournament({ episodeId }),
    queryFn: async () => await getNextTournament({ episodeId }),
  });

/**
 * For retrieving a paginated list of the tournaments occurring during the given episode.
 */
export const useTournamentList = ({
  episodeId,
  page,
}: EpisodeTournamentListRequest): UseQueryResult<
  PaginatedTournamentList,
  Error
> =>
  useQuery({
    queryKey: episodeQueryKeys.tournamentList({ episodeId, page }),
    queryFn: async () => await getTournamentList({ episodeId }),
  });

/**
 * For retrieving the information of a specific tournament occurring during the given episode.
 */
export const useTournamentInfo = ({
  episodeId,
  id,
}: EpisodeTournamentRetrieveRequest): UseQueryResult<Tournament, Error> =>
  useQuery({
    queryKey: episodeQueryKeys.tournamentInfo({ episodeId, id }),
    queryFn: async () => await getTournamentInfo({ episodeId, id }),
  });
