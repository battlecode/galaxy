import type {
  Episode,
  EpisodeEListRequest,
  EpisodeERetrieveRequest,
  EpisodeMapListRequest,
  EpisodeTournamentListRequest,
  EpisodeTournamentNextRetrieveRequest,
  EpisodeTournamentRetrieveRequest,
  EpisodeTournamentRoundListRequest,
  EpisodeTournamentRoundRetrieveRequest,
  GameMap,
  PaginatedEpisodeList,
  PaginatedTournamentList,
  PaginatedTournamentRoundList,
  ResponseError,
  Tournament,
  TournamentRound,
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
  getTournamentRoundInfo,
  getTournamentRoundList,
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

export const tournamentRoundInfoFactory: QueryFactory<
  EpisodeTournamentRoundRetrieveRequest,
  TournamentRound
> = {
  queryKey: episodeQueryKeys.tournamentRoundInfo,
  queryFn: async ({ episodeId, tournament, id }) =>
    await getTournamentRoundInfo({ episodeId, tournament, id }),
} as const;

export const tournamentRoundListFactory: PaginatedQueryFactory<
  EpisodeTournamentRoundListRequest,
  PaginatedTournamentRoundList
> = {
  queryKey: episodeQueryKeys.tournamentRoundList,
  queryFn: async (request, queryClient, prefetchNext) => {
    const result = await getTournamentRoundList(request);
    // Prefetch the next page if we want to prefetch
    if (prefetchNext) {
      await prefetchNextPage(
        request,
        result,
        {
          queryKey: episodeQueryKeys.tournamentRoundList,
          queryFn: tournamentRoundListFactory.queryFn,
        },
        queryClient,
      );
    }

    return result;
  },
};
