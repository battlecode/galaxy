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
import type { PaginatedQueryFactory, QueryFactory } from "../apiTypes";
import { prefetchNextPage } from "../helpers";
import {
  getEpisodeInfo,
  getEpisodeList,
  getEpisodeMaps,
  getNextTournament,
  getTournamentInfo,
  getTournamentList,
} from "./episodeApi";
import { episodeQueryKeys } from "./episodeKeys";

export const episodeListFactory: PaginatedQueryFactory<
  EpisodeEListRequest,
  PaginatedEpisodeList
> = {
  queryKey: episodeQueryKeys.list,
  queryFn: async ({ page }, queryClient, prefetchNext) => {
    const result = await getEpisodeList({ page });
    // Prefetch the next page if we want to prefetch
    if (prefetchNext) {
      await prefetchNextPage(
        { page },
        result,
        episodeQueryKeys.list,
        episodeListFactory.queryFn,
        queryClient,
      );
    }

    return result;
  },
} as const;

export const episodeInfoFactory: QueryFactory<
  EpisodeERetrieveRequest,
  Episode
> = {
  queryKey: episodeQueryKeys.info,
  queryFn: async ({ id }) => {
    return await getEpisodeInfo({ id });
  },
} as const;

export const episodeMapsFactory: QueryFactory<
  EpisodeMapListRequest,
  GameMap[]
> = {
  queryKey: episodeQueryKeys.maps,
  queryFn: async ({ episodeId }) => {
    return await getEpisodeMaps({ episodeId });
  },
} as const;

export const tournamentListFactory: PaginatedQueryFactory<
  EpisodeTournamentListRequest,
  PaginatedTournamentList
> = {
  queryKey: episodeQueryKeys.tournamentList,
  queryFn: async (request, queryClient, prefetchNext) => {
    const result = await getTournamentList(request);
    // Prefetch the next page if we want to prefetch
    if (prefetchNext) {
      await prefetchNextPage(
        request,
        result,
        episodeQueryKeys.tournamentList,
        tournamentListFactory.queryFn,
        queryClient,
      );
    }

    return result;
  },
} as const;

export const nextTournamentFactory: QueryFactory<
  EpisodeTournamentNextRetrieveRequest,
  Tournament | null
> = {
  queryKey: episodeQueryKeys.nextTournament,
  queryFn: async ({ episodeId }) => {
    try {
      return await getNextTournament({ episodeId });
    } catch (err) {
      // If there is no next tournament, just return null.
      const responseError = err as ResponseError;
      if (responseError.response.status === 404) return null;
      else throw responseError;
    }
  },
} as const;

export const tournamentInfoFactory: QueryFactory<
  EpisodeTournamentRetrieveRequest,
  Tournament
> = {
  queryKey: episodeQueryKeys.tournamentInfo,
  queryFn: async ({ episodeId, id }) => {
    return await getTournamentInfo({ episodeId, id });
  },
} as const;
