import type {
  CompeteMatchHistoricalRatingTopNListRequest,
  CompeteMatchHistoricalRatingListRequest,
  CompeteMatchListRequest,
  CompeteMatchScrimmageListRequest,
  CompeteMatchScrimmagingRecordRetrieveRequest,
  CompeteMatchTournamentListRequest,
  CompeteRequestInboxListRequest,
  CompeteRequestOutboxListRequest,
  CompeteSubmissionListRequest,
  CompeteSubmissionTournamentListRequest,
  HistoricalRating,
  PaginatedMatchList,
  PaginatedScrimmageRequestList,
  PaginatedSubmissionList,
  TournamentSubmission,
  ScrimmageRecord,
} from "../_autogen";
import type { PaginatedQueryFactory, QueryFactory } from "../apiTypes";
import { competeQueryKeys } from "./competeKeys";
import {
  getAllUserTournamentSubmissions,
  getMatchesList,
  getRatingTopNList,
  getRatingList,
  getScrimmagesListByTeam,
  getScrimmagingRecord,
  getSubmissionsList,
  getTournamentMatchesList,
  getUserScrimmagesInboxList,
  getUserScrimmagesOutboxList,
} from "./competeApi";
import { prefetchNextPage } from "../helpers";

export const subsListFactory: PaginatedQueryFactory<
  CompeteSubmissionListRequest,
  PaginatedSubmissionList
> = {
  queryKey: competeQueryKeys.subList,
  queryFn: async (request, queryClient, prefetchNext) => {
    const result = await getSubmissionsList(request);
    // Prefetch the next page if we want to prefetch
    if (prefetchNext) {
      await prefetchNextPage(
        request,
        result,
        competeQueryKeys.subList,
        subsListFactory.queryFn,
        queryClient,
      );
    }

    return result;
  },
} as const;

export const tournamentSubsListFactory: QueryFactory<
  CompeteSubmissionTournamentListRequest,
  TournamentSubmission[]
> = {
  queryKey: competeQueryKeys.tourneySubs,
  queryFn: async (request: CompeteSubmissionTournamentListRequest) => {
    return await getAllUserTournamentSubmissions(request);
  },
} as const;

export const scrimmageInboxListFactory: PaginatedQueryFactory<
  CompeteRequestInboxListRequest,
  PaginatedScrimmageRequestList
> = {
  queryKey: competeQueryKeys.inbox,
  queryFn: async (request, queryClient, prefetchNext) => {
    const result = await getUserScrimmagesInboxList(request);
    // Prefetch the next page if we want to prefetch
    if (prefetchNext) {
      await prefetchNextPage(
        request,
        result,
        competeQueryKeys.inbox,
        scrimmageInboxListFactory.queryFn,
        queryClient,
      );
    }

    return result;
  },
} as const;

export const scrimmageOutboxListFactory: PaginatedQueryFactory<
  CompeteRequestOutboxListRequest,
  PaginatedScrimmageRequestList
> = {
  queryKey: competeQueryKeys.outbox,
  queryFn: async (request, queryClient, prefetchNext) => {
    const result = await getUserScrimmagesOutboxList(request);
    // Prefetch the next page if we want to prefetch
    if (prefetchNext) {
      await prefetchNextPage(
        request,
        result,
        competeQueryKeys.outbox,
        scrimmageOutboxListFactory.queryFn,
        queryClient,
      );
    }

    return result;
  },
} as const;

export const userScrimmageListFactory: PaginatedQueryFactory<
  CompeteMatchScrimmageListRequest,
  PaginatedMatchList
> = {
  queryKey: competeQueryKeys.scrimsMeList,
  queryFn: async ({ episodeId, page }, queryClient, prefetchNext) => {
    const result = await getScrimmagesListByTeam({ episodeId, page });
    // Prefetch the next page if we want to prefetch
    if (prefetchNext) {
      await prefetchNextPage(
        { episodeId, page },
        result,
        competeQueryKeys.scrimsMeList,
        userScrimmageListFactory.queryFn,
        queryClient,
      );
    }

    return result;
  },
} as const;

export const teamScrimmageListFactory: PaginatedQueryFactory<
  CompeteMatchScrimmageListRequest,
  PaginatedMatchList
> = {
  queryKey: competeQueryKeys.scrimsOtherList,
  queryFn: async (request, queryClient, prefetchNext) => {
    const result = await getScrimmagesListByTeam(request);
    // Prefetch the next page if we want to prefetch
    if (prefetchNext) {
      await prefetchNextPage(
        request,
        result,
        competeQueryKeys.scrimsOtherList,
        teamScrimmageListFactory.queryFn,
        queryClient,
      );
    }

    return result;
  },
} as const;

export const matchListFactory: PaginatedQueryFactory<
  CompeteMatchListRequest,
  PaginatedMatchList
> = {
  queryKey: competeQueryKeys.matchList,
  queryFn: async (request, queryClient, prefetchNext) => {
    const result = await getMatchesList(request);
    // Prefetch the next page if we want to prefetch
    if (prefetchNext) {
      await prefetchNextPage(
        request,
        result,
        competeQueryKeys.matchList,
        matchListFactory.queryFn,
        queryClient,
      );
    }

    return result;
  },
} as const;

export const tournamentMatchListFactory: PaginatedQueryFactory<
  CompeteMatchTournamentListRequest,
  PaginatedMatchList
> = {
  queryKey: competeQueryKeys.tourneyMatchList,
  queryFn: async (request, queryClient, prefetchNext) => {
    const result = await getTournamentMatchesList(request);
    // Prefetch the next page if we want to prefetch
    if (prefetchNext) {
      await prefetchNextPage(
        request,
        result,
        competeQueryKeys.tourneyMatchList,
        tournamentMatchListFactory.queryFn,
        queryClient,
      );
    }

    return result;
  },
} as const;

export const ratingHistoryTopNFactory: QueryFactory<
  CompeteMatchHistoricalRatingTopNListRequest,
  HistoricalRating[]
> = {
  queryKey: competeQueryKeys.ratingHistoryTopNList,
  queryFn: async ({ episodeId, n }) =>
    await getRatingTopNList({ episodeId, n }),
} as const;

export const ratingHistoryFactory: QueryFactory<
  CompeteMatchHistoricalRatingListRequest,
  HistoricalRating[]
> = {
  queryKey: competeQueryKeys.ratingHistoryTopList,
  queryFn: async ({ episodeId, teamId }) =>
    await getRatingList({ episodeId, teamId }),
} as const;

export const ratingHistoryMeFactory: QueryFactory<
  { episodeId: string },
  HistoricalRating[]
> = {
  queryKey: competeQueryKeys.ratingHistoryMeList,
  queryFn: async ({ episodeId }) =>
    await getRatingList({ episodeId, teamId: undefined }),
} as const;

export const scrimmagingRecordFactory: QueryFactory<
  CompeteMatchScrimmagingRecordRetrieveRequest,
  ScrimmageRecord
> = {
  queryKey: competeQueryKeys.scrimmagingRecord,
  queryFn: async ({ episodeId, teamId, scrimmageType }) => {
    return await getScrimmagingRecord({ episodeId, teamId, scrimmageType });
  },
} as const;
