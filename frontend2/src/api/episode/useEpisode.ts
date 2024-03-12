import {
  type UseQueryResult,
  useQuery,
  type QueryClient,
} from "@tanstack/react-query";
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
import { buildKey } from "../helpers";
import {
  episodeInfoFactory,
  episodeListFactory,
  episodeMapsFactory,
  nextTournamentFactory,
  tournamentInfoFactory,
  tournamentListFactory,
} from "./episodeFactories";

// ---------- QUERY HOOKS ---------- //
/**
 * For retrieving the given episode's info.
 */
export const useEpisodeInfo = ({
  id,
}: EpisodeERetrieveRequest): UseQueryResult<Episode, Error> =>
  useQuery({
    queryKey: buildKey(episodeInfoFactory.queryKey, { id }),
    queryFn: async () => await episodeInfoFactory.queryFn({ id }),
    staleTime: 5 * 1000 * 60, // 5 minutes
  });

/**
 * For retrieving a paginated list of Battlecode episodes.
 */
export const useEpisodeList = (
  { page }: EpisodeEListRequest,
  queryClient: QueryClient,
): UseQueryResult<PaginatedEpisodeList, Error> =>
  useQuery({
    queryKey: buildKey(episodeListFactory.queryKey, { page }),
    queryFn: async () =>
      await episodeListFactory.queryFn({ page }, queryClient, true),
    staleTime: Infinity,
  });

/**
 * For retrieving the maps of the given episode.
 */
export const useEpisodeMaps = ({
  episodeId,
}: EpisodeMapListRequest): UseQueryResult<GameMap[], Error> =>
  useQuery({
    queryKey: buildKey(episodeMapsFactory.queryKey, { episodeId }),
    queryFn: async () => await episodeMapsFactory.queryFn({ episodeId }),
  });

/**
 * For retrieving the next tournament occurring during the given episode.
 */
export const useNextTournament = ({
  episodeId,
}: EpisodeTournamentNextRetrieveRequest): UseQueryResult<
  Tournament | null,
  Error
> =>
  useQuery({
    queryKey: buildKey(nextTournamentFactory.queryKey, { episodeId }),
    queryFn: async () => await nextTournamentFactory.queryFn({ episodeId }),
  });

/**
 * For retrieving a paginated list of the tournaments occurring during the given episode.
 */
export const useTournamentList = (
  { episodeId, page }: EpisodeTournamentListRequest,
  queryClient: QueryClient,
): UseQueryResult<PaginatedTournamentList, Error> =>
  useQuery({
    queryKey: buildKey(tournamentListFactory.queryKey, { episodeId, page }),
    queryFn: async () =>
      await tournamentListFactory.queryFn(
        { episodeId, page },
        queryClient,
        true,
      ),
  });

/**
 * For retrieving the information of a specific tournament occurring during the given episode.
 */
export const useTournamentInfo = ({
  episodeId,
  id,
}: EpisodeTournamentRetrieveRequest): UseQueryResult<Tournament, Error> =>
  useQuery({
    queryKey: buildKey(tournamentInfoFactory.queryKey, { episodeId, id }),
    queryFn: async () => await tournamentInfoFactory.queryFn({ episodeId, id }),
  });
