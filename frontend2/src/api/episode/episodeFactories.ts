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
import {
  HttpStatusCode,
  type PaginatedQueryFactory,
  type QueryFactory,
} from "../apiTypes";
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
        {
          queryKey: episodeQueryKeys.list,
          queryFn: episodeListFactory.queryFn,
        },
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
  queryFn: async ({ id }) => await getEpisodeInfo({ id }),
} as const;

export const episodeMapsFactory: QueryFactory<
  EpisodeMapListRequest,
  GameMap[]
> = {
  queryKey: episodeQueryKeys.maps,
  queryFn: async ({ episodeId }) => await getEpisodeMaps({ episodeId }),
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
        {
          queryKey: episodeQueryKeys.tournamentList,
          queryFn: tournamentListFactory.queryFn,
        },
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
      if (responseError.response.status === HttpStatusCode.NOT_FOUND)
        return null;
      else throw responseError;
    }
  },
} as const;

export const tournamentInfoFactory: QueryFactory<
  EpisodeTournamentRetrieveRequest,
  Tournament
> = {
  queryKey: episodeQueryKeys.tournamentInfo,
  queryFn: async ({ episodeId, id }) =>
    await getTournamentInfo({ episodeId, id }),
} as const;
