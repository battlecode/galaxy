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
import { MILLIS_SECOND, SECONDS_MINUTE } from "utils/utilTypes";

// ---------- QUERY HOOKS ---------- //
const EPISODE_WAIT_TIME = 5;

/**
 * For retrieving the given episode's info.
 */
export const useEpisodeInfo = ({
  id,
}: EpisodeERetrieveRequest): UseQueryResult<Episode> =>
  useQuery({
    queryKey: buildKey(episodeInfoFactory.queryKey, { id }),
    queryFn: async () => await episodeInfoFactory.queryFn({ id }),
    staleTime: EPISODE_WAIT_TIME * MILLIS_SECOND * SECONDS_MINUTE,
  });

/**
 * For retrieving a paginated list of Battlecode episodes.
 */
export const useEpisodeList = (
  { page }: EpisodeEListRequest,
  queryClient: QueryClient,
): UseQueryResult<PaginatedEpisodeList> =>
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
}: EpisodeMapListRequest): UseQueryResult<GameMap[]> =>
  useQuery({
    queryKey: buildKey(episodeMapsFactory.queryKey, { episodeId }),
    queryFn: async () => await episodeMapsFactory.queryFn({ episodeId }),
  });

/**
 * For retrieving the next tournament occurring during the given episode.
 */
export const useNextTournament = ({
  episodeId,
}: EpisodeTournamentNextRetrieveRequest): UseQueryResult<Tournament | null> =>
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
): UseQueryResult<PaginatedTournamentList> =>
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
}: EpisodeTournamentRetrieveRequest): UseQueryResult<Tournament> =>
  useQuery({
    queryKey: buildKey(tournamentInfoFactory.queryKey, { episodeId, id }),
    queryFn: async () => await tournamentInfoFactory.queryFn({ episodeId, id }),
  });
