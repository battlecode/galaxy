// ---------- QUERY HOOKS ---------- //

import {
  UseMutationResult,
  UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { competeMutationKeys, competeQueryKeys } from "./competeKeys";
import type {
  CompeteMatchListRequest,
  CompeteMatchScrimmageListRequest,
  CompeteMatchTournamentListRequest,
  CompeteRequestAcceptCreateRequest,
  CompeteRequestCreateRequest,
  CompeteRequestInboxListRequest,
  CompeteRequestOutboxListRequest,
  CompeteRequestRejectCreateRequest,
  CompeteSubmissionCreateRequest,
  CompeteSubmissionListRequest,
  CompeteSubmissionTournamentListRequest,
  PaginatedMatchList,
  PaginatedScrimmageRequestList,
  PaginatedSubmissionList,
  ScrimmageRequest,
  Submission,
  TournamentSubmission,
} from "../_autogen";
import {
  acceptScrimmage,
  getAllUserTournamentSubmissions,
  getMatchesList,
  getScrimmagesListByTeam,
  getSubmissionsList,
  getTournamentMatchesList,
  getUserScrimmagesInboxList,
  getUserScrimmagesOutboxList,
  rejectScrimmage,
  requestScrimmage,
  uploadSubmission,
} from "./competeApi";
import { isPresent } from "../../utils/utilTypes";

// ---------- QUERY HOOKS ---------- //
/**
 * For retrieving a list of the currently logged in user's submissions.
 */
export const useSubmissionsList = ({
  episodeId,
  page,
}: CompeteSubmissionListRequest): UseQueryResult<
  PaginatedSubmissionList,
  Error
> =>
  useQuery({
    queryKey: competeQueryKeys.subList({ episodeId, page }),
    queryFn: async () => {
      const queryClient = useQueryClient();
      const result = await getSubmissionsList({ episodeId, page });

      // Prefetch the next page if it exists
      if (isPresent(result.next)) {
        // If no page provided, then we just fetched page 1
        const nextPage = isPresent(page) ? page + 1 : 2;
        // TODO: ensure correct prefetching behavior!
        queryClient.prefetchQuery({
          queryKey: competeQueryKeys.subList({
            episodeId,
            page: nextPage,
          }),
          queryFn: async () =>
            await getSubmissionsList({ episodeId, page: nextPage }),
          staleTime: 5 * 1000 * 60, // 5 minutes
        });
      }
      return result;
    },
    staleTime: 5 * 1000 * 60, // 5 minutes
  });

/**
 * For retrieving a list of the currently logged in user's tournament submissions.
 */
export const useTournamentSubmissionsList = ({
  episodeId,
}: CompeteSubmissionTournamentListRequest): UseQueryResult<
  TournamentSubmission[],
  Error
> =>
  useQuery({
    queryKey: competeQueryKeys.tourneySubs({ episodeId }),
    queryFn: async () => await getAllUserTournamentSubmissions({ episodeId }),
    staleTime: 1000 * 60, // 1 minute
  });

/**
 * For retrieving a paginated list of the currently logged in user's incoming scrimmage requests.
 */
export const useScrimmageInboxList = ({
  episodeId,
  page,
}: CompeteRequestInboxListRequest): UseQueryResult<
  PaginatedScrimmageRequestList,
  Error
> =>
  useQuery({
    queryKey: competeQueryKeys.inbox({ episodeId, page }),
    queryFn: async () => {
      const queryClient = useQueryClient();
      const result = await getUserScrimmagesInboxList({ episodeId, page });

      // Prefetch the next page if it exists
      if (isPresent(result.next)) {
        // If no page provided, then we just fetched page 1
        const nextPage = isPresent(page) ? page + 1 : 2;
        // TODO: ensure correct prefetching behavior!
        queryClient.prefetchQuery({
          queryKey: competeQueryKeys.inbox({
            episodeId,
            page: nextPage,
          }),
          queryFn: async () =>
            await getUserScrimmagesInboxList({ episodeId, page: nextPage }),
          staleTime: 1000 * 30, // 30 seconds
        });
      }
      return result;
    },
    staleTime: 1000 * 30, // 30 seconds
  });

/**
 * For retrieving a paginated list of the currently logged in user's outgoing scrimmage requests.
 */
export const useScrimmageOutboxList = ({
  episodeId,
  page,
}: CompeteRequestOutboxListRequest): UseQueryResult<
  PaginatedScrimmageRequestList,
  Error
> =>
  useQuery({
    queryKey: competeQueryKeys.outbox({ episodeId, page }),
    queryFn: async () => {
      const queryClient = useQueryClient();
      const result = await getUserScrimmagesOutboxList({ episodeId, page });

      // Prefetch the next page if it exists
      if (isPresent(result.next)) {
        // If no page provided, then we just fetched page 1
        const nextPage = isPresent(page) ? page + 1 : 2;
        // TODO: ensure correct prefetching behavior!
        queryClient.prefetchQuery({
          queryKey: competeQueryKeys.outbox({
            episodeId,
            page: nextPage,
          }),
          queryFn: async () =>
            await getUserScrimmagesOutboxList({ episodeId, page: nextPage }),
          staleTime: 5 * 1000 * 60, // 5 minutes
        });
      }
      return result;
    },
    staleTime: 5 * 1000 * 60, // 5 minutes
  });

/**
 * For retrieving a paginated list of the given logged in user's team's past scrimmages.
 */
export const useUserScrimmageList = ({
  episodeId,
  page,
}: CompeteMatchScrimmageListRequest): UseQueryResult<
  PaginatedMatchList,
  Error
> =>
  useQuery({
    queryKey: competeQueryKeys.scrimsMeList({ episodeId, page }),
    queryFn: async () => {
      const queryClient = useQueryClient();
      const result = await getScrimmagesListByTeam({ episodeId, page });

      // Prefetch the next page if it exists
      if (isPresent(result.next)) {
        // If no page provided, then we just fetched page 1
        const nextPage = isPresent(page) ? page + 1 : 2;
        // TODO: ensure correct prefetching behavior!
        queryClient.prefetchQuery({
          queryKey: competeQueryKeys.scrimsMeList({
            episodeId,
            page: nextPage,
          }),
          queryFn: async () =>
            await getScrimmagesListByTeam({ episodeId, page: nextPage }),
          staleTime: 1000 * 30, // 30 seconds
        });
      }
      return result;
    },
    staleTime: 1000 * 30, // 30 seconds
  });

/**
 * For retrieving a paginated list of the given team's past scrimmages.
 */
export const useTeamScrimmageList = ({
  episodeId,
  teamId,
  page,
}: CompeteMatchScrimmageListRequest): UseQueryResult<
  PaginatedMatchList,
  Error
> =>
  useQuery({
    queryKey: competeQueryKeys.scrimsOtherList({ episodeId, teamId, page }),
    queryFn: async () => {
      const queryClient = useQueryClient();
      const result = await getScrimmagesListByTeam({ episodeId, teamId, page });

      // Prefetch the next page if it exists
      if (isPresent(result.next)) {
        // If no page provided, then we just fetched page 1
        const nextPage = isPresent(page) ? page + 1 : 2;
        // TODO: ensure correct prefetching behavior!
        queryClient.prefetchQuery({
          queryKey: competeQueryKeys.scrimsOtherList({
            episodeId,
            teamId,
            page: nextPage,
          }),
          queryFn: async () =>
            await getScrimmagesListByTeam({
              episodeId,
              teamId,
              page: nextPage,
            }),
          staleTime: 1000 * 60, // 1 minute
        });
      }
      return result;
    },
    staleTime: 1000 * 60, // 1 minute
  });

/**
 * For retrieving a paginated list of the matches in a given episode.
 */
export const useMatchList = ({
  episodeId,
  page,
}: CompeteMatchListRequest): UseQueryResult<PaginatedMatchList, Error> =>
  useQuery({
    queryKey: competeQueryKeys.matchList({ episodeId, page }),
    queryFn: async () => {
      const queryClient = useQueryClient();
      const result = await getMatchesList({ episodeId, page });

      // Prefetch the next page if it exists
      if (isPresent(result.next)) {
        // If no page provided, then we just fetched page 1
        const nextPage = isPresent(page) ? page + 1 : 2;
        // TODO: ensure correct prefetching behavior!
        queryClient.prefetchQuery({
          queryKey: competeQueryKeys.matchList({
            episodeId,
            page: nextPage,
          }),
          queryFn: async () =>
            await getMatchesList({ episodeId, page: nextPage }),
        });
      }
      return result;
    },
  });

/**
 * For retrieving a paginated list of the matches in a given tournament.
 */
export const useTournamentMatchList = ({
  episodeId,
  teamId,
  tournamentId,
  roundId,
  page,
}: CompeteMatchTournamentListRequest): UseQueryResult<
  PaginatedMatchList,
  Error
> =>
  useQuery({
    queryKey: competeQueryKeys.tourneyMatchList({
      episodeId,
      teamId,
      tournamentId,
      roundId,
      page,
    }),
    queryFn: async () => {
      const queryClient = useQueryClient();
      const result = await getTournamentMatchesList({
        episodeId,
        teamId,
        tournamentId,
        roundId,
        page,
      });

      // Prefetch the next page if it exists
      if (isPresent(result.next)) {
        // If no page provided, then we just fetched page 1
        const nextPage = isPresent(page) ? page + 1 : 2;
        // TODO: ensure correct prefetching behavior!
        queryClient.prefetchQuery({
          queryKey: competeQueryKeys.tourneyMatchList({
            episodeId,
            teamId,
            tournamentId,
            roundId,
            page: nextPage,
          }),
          queryFn: async () =>
            await getTournamentMatchesList({
              episodeId,
              teamId,
              tournamentId,
              roundId,
              page: nextPage,
            }),
        });
      }
      return result;
    },
    staleTime: 1000 * 60, // 1 minute
  });

// ---------- MUTATION HOOKS ---------- //
/**
 * For uploading a new submission.
 */
export const useUploadSubmission = ({
  episodeId,
}: {
  episodeId: string;
}): UseMutationResult<
  Submission,
  Error,
  CompeteSubmissionCreateRequest,
  unknown
> =>
  useMutation({
    mutationKey: competeMutationKeys.uploadSub({ episodeId }),
    mutationFn: async ({
      episodeId,
      _package,
      description,
      sourceCode,
    }: CompeteSubmissionCreateRequest) => {
      const queryClient = useQueryClient();

      const result = await uploadSubmission({
        episodeId,
        _package,
        description,
        sourceCode,
      });

      // Invalidate all submissions queries
      queryClient.invalidateQueries({
        queryKey: competeQueryKeys.subBase({ episodeId }),
      });

      // Prefetch the first page of the submissions list
      queryClient.prefetchQuery({
        queryKey: competeQueryKeys.subList({ episodeId, page: 1 }),
        queryFn: async () => await getSubmissionsList({ episodeId, page: 1 }),
        staleTime: 5 * 1000 * 60, // 5 minutes
      });

      return result;
    },
  });

/**
 * For requesting a scrimmage.
 */
export const useRequestScrimmage = ({
  episodeId,
}: {
  episodeId: string;
}): UseMutationResult<
  ScrimmageRequest,
  Error,
  CompeteRequestCreateRequest,
  unknown
> =>
  useMutation({
    mutationKey: competeMutationKeys.requestScrim({ episodeId }),
    mutationFn: async ({
      episodeId,
      scrimmageRequestRequest,
    }: CompeteRequestCreateRequest) => {
      const queryClient = useQueryClient();

      const result = await requestScrimmage({
        episodeId,
        scrimmageRequestRequest,
      });

      // Invalidate the outbox query
      // TODO: ensure correct invalidation behavior!
      queryClient.invalidateQueries({
        queryKey: competeQueryKeys.outbox({ episodeId }),
      });

      // Prefetch the first page of the outbox list
      queryClient.prefetchQuery({
        queryKey: competeQueryKeys.outbox({ episodeId, page: 1 }),
        queryFn: async () =>
          await getUserScrimmagesOutboxList({ episodeId, page: 1 }),
        staleTime: 5 * 1000 * 60, // 5 minutes
      });

      return result;
    },
  });

/**
 * For accepting a scrimmage request.
 */
export const useAcceptScrimmage = ({
  episodeId,
}: {
  episodeId: string;
}): UseMutationResult<
  void,
  Error,
  CompeteRequestAcceptCreateRequest,
  unknown
> =>
  useMutation({
    mutationKey: competeMutationKeys.acceptScrim({ episodeId }),
    mutationFn: async ({
      episodeId,
      id,
    }: CompeteRequestAcceptCreateRequest) => {
      const queryClient = useQueryClient();

      await acceptScrimmage({ episodeId, id });

      // Invalidate the inbox query
      // TODO: ensure correct invalidation behavior!
      queryClient.invalidateQueries({
        queryKey: competeQueryKeys.inbox({ episodeId }),
      });

      // Prefetch the first page of the inbox list
      queryClient.prefetchQuery({
        queryKey: competeQueryKeys.inbox({ episodeId, page: 1 }),
        queryFn: async () =>
          await getUserScrimmagesInboxList({ episodeId, page: 1 }),
        staleTime: 5 * 1000 * 60, // 5 minutes
      });
    },
  });

/**
 * For rejecting a scrimmage request.
 */
export const useRejectScrimmage = ({
  episodeId,
}: {
  episodeId: string;
}): UseMutationResult<
  void,
  Error,
  CompeteRequestRejectCreateRequest,
  unknown
> =>
  useMutation({
    mutationKey: competeMutationKeys.rejectScrim({ episodeId }),
    mutationFn: async ({
      episodeId,
      id,
    }: CompeteRequestRejectCreateRequest) => {
      const queryClient = useQueryClient();

      await rejectScrimmage({ episodeId, id });

      // Invalidate the inbox query
      // TODO: ensure correct invalidation behavior!
      queryClient.invalidateQueries({
        queryKey: competeQueryKeys.inbox({ episodeId }),
      });

      // Prefetch the first page of the inbox list
      queryClient.prefetchQuery({
        queryKey: competeQueryKeys.inbox({ episodeId, page: 1 }),
        queryFn: async () =>
          await getUserScrimmagesInboxList({ episodeId, page: 1 }),
        staleTime: 5 * 1000 * 60, // 5 minutes
      });
    },
  });
