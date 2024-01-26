import {
  type UseQueryResult,
  useQuery,
  type QueryClient,
} from "@tanstack/react-query";
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
  ResponseError,
  Tournament,
} from "../_autogen";
import { isPresent } from "../../utils/utilTypes";
import toast from "react-hot-toast";

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
    staleTime: Infinity,
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
}: EpisodeTournamentNextRetrieveRequest): UseQueryResult<
  Tournament | null,
  Error
> =>
  useQuery({
    queryKey: episodeQueryKeys.nextTournament({ episodeId }),
    queryFn: async () => {
      try {
        return await getNextTournament({ episodeId });
      } catch (err) {
        // If there is no next tournament, just return null.
        const responseError = err as ResponseError;
        if (responseError.response.status === 404) return null;
        else throw responseError;
      }
    },
  });

/**
 * For retrieving a paginated list of the tournaments occurring during the given episode.
 */
export const useTournamentList = (
  { episodeId, page }: EpisodeTournamentListRequest,
  queryClient: QueryClient,
): UseQueryResult<PaginatedTournamentList, Error> =>
  useQuery({
    queryKey: episodeQueryKeys.tournamentList({ episodeId, page }),
    queryFn: async () => {
      const result = await getTournamentList({ episodeId, page });

      // Prefetch the next page if it exists
      if (isPresent(result.next)) {
        // If no page provided, then we just fetched page 1
        const nextPage = isPresent(page) ? page + 1 : 2;
        queryClient
          .prefetchQuery({
            queryKey: episodeQueryKeys.tournamentList({
              episodeId,
              page: nextPage,
            }),
            queryFn: async () =>
              await getTournamentList({ episodeId, page: nextPage }),
          })
          .catch((e) => toast.error((e as Error).message));
      }
      return result;
    },
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
