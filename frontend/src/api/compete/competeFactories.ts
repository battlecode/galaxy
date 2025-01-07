import type {
  CompeteMatchHistoricalRatingTopNListRequest,
  CompeteMatchHistoricalRatingRetrieveRequest,
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
  getRatingHistory,
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
        {
          queryKey: competeQueryKeys.subList,
          queryFn: subsListFactory.queryFn,
        },
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
  queryFn: async (request: CompeteSubmissionTournamentListRequest) =>
    await getAllUserTournamentSubmissions(request),
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
        {
          queryKey: competeQueryKeys.inbox,
          queryFn: scrimmageInboxListFactory.queryFn,
        },
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
        {
          queryKey: competeQueryKeys.outbox,
          queryFn: scrimmageOutboxListFactory.queryFn,
        },
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
        {
          queryKey: competeQueryKeys.scrimsMeList,
          queryFn: userScrimmageListFactory.queryFn,
        },
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
        {
          queryKey: competeQueryKeys.scrimsOtherList,
          queryFn: teamScrimmageListFactory.queryFn,
        },
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
        {
          queryKey: competeQueryKeys.matchList,
          queryFn: matchListFactory.queryFn,
        },
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
        {
          queryKey: competeQueryKeys.tourneyMatchList,
          queryFn: tournamentMatchListFactory.queryFn,
        },
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
  CompeteMatchHistoricalRatingRetrieveRequest,
  HistoricalRating
> = {
  queryKey: competeQueryKeys.ratingHistory,
  queryFn: async ({ episodeId, teamId }) =>
    await getRatingHistory({ episodeId, teamId }),
} as const;

export const userRatingHistoryFactory: QueryFactory<
  { episodeId: string },
  HistoricalRating
> = {
  queryKey: competeQueryKeys.ratingHistoryMe,
  queryFn: async ({ episodeId }) => await getRatingHistory({ episodeId }),
} as const;

// export const scrimmagingRecordFactory: QueryFactory<
//   CompeteMatchScrimmagingRecordRetrieveRequest,
//   ScrimmageRecord
// > = {
//   queryKey: competeQueryKeys.scrimmagingRecord,
//   queryFn: async ({ episodeId, teamId, scrimmageType }) =>
//     await getScrimmagingRecord({ episodeId, teamId, scrimmageType }),
// } as const;
export const scrimmagingRecordFactory: QueryFactory<
  CompeteMatchScrimmagingRecordRetrieveRequest,
  ScrimmageRecord
> = {
  queryKey: competeQueryKeys.scrimmagingRecord,
  queryFn: async ({ episodeId, teamId }) =>
    await getScrimmagingRecord({ episodeId, teamId }),
} as const;
