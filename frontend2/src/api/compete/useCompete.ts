// ---------- QUERY HOOKS ---------- //

import {
  type UseMutationResult,
  type UseQueryResult,
  useMutation,
  useQuery,
  type QueryClient,
} from "@tanstack/react-query";
import { competeMutationKeys, competeQueryKeys } from "./competeKeys";
import type {
  CompeteMatchListRequest,
  CompeteMatchScrimmageListRequest,
  CompeteMatchTournamentListRequest,
  CompeteRequestAcceptCreateRequest,
  CompeteRequestCreateRequest,
  CompeteRequestDestroyRequest,
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
  cancelScrimmage,
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
import toast from "react-hot-toast";

// ---------- QUERY HOOKS ---------- //
/**
 * For retrieving a list of the currently logged in user's submissions.
 */
export const useSubmissionsList = (
  { episodeId, page }: CompeteSubmissionListRequest,
  queryClient: QueryClient,
): UseQueryResult<PaginatedSubmissionList, Error> =>
  useQuery({
    queryKey: competeQueryKeys.subList({ episodeId, page }),
    queryFn: async () => {
      const result = await getSubmissionsList({ episodeId, page });

      // Prefetch the next page if it exists
      if (isPresent(result.next)) {
        // If no page provided, then we just fetched page 1
        const nextPage = isPresent(page) ? page + 1 : 2;
        // TODO: ensure correct prefetching behavior!
        queryClient
          .prefetchQuery({
            queryKey: competeQueryKeys.subList({
              episodeId,
              page: nextPage,
            }),
            queryFn: async () =>
              await getSubmissionsList({ episodeId, page: nextPage }),
          })
          .catch((e) => toast.error((e as Error).message));
      }
      return result;
    },
  });

/**
 * For retrieving a list of the currently logged in user's tournament submissions.
 */
export const useTournamentSubmissions = ({
  episodeId,
}: CompeteSubmissionTournamentListRequest): UseQueryResult<
  TournamentSubmission[],
  Error
> =>
  useQuery({
    queryKey: competeQueryKeys.tourneySubs({ episodeId }),
    queryFn: async () => await getAllUserTournamentSubmissions({ episodeId }),
  });

/**
 * For retrieving a paginated list of the currently logged in user's incoming scrimmage requests.
 */
export const useScrimmageInboxList = (
  { episodeId, page }: CompeteRequestInboxListRequest,
  queryClient: QueryClient,
): UseQueryResult<PaginatedScrimmageRequestList, Error> =>
  useQuery({
    queryKey: competeQueryKeys.inbox({ episodeId, page }),
    queryFn: async () => {
      const result = await getUserScrimmagesInboxList({ episodeId, page });

      // Prefetch the next page if it exists
      if (isPresent(result.next)) {
        // If no page provided, then we just fetched page 1
        const nextPage = isPresent(page) ? page + 1 : 2;
        // TODO: ensure correct prefetching behavior!
        queryClient
          .prefetchQuery({
            queryKey: competeQueryKeys.inbox({
              episodeId,
              page: nextPage,
            }),
            queryFn: async () =>
              await getUserScrimmagesInboxList({ episodeId, page: nextPage }),
          })
          .catch((e) => toast.error((e as Error).message));
      }
      return result;
    },
  });

/**
 * For retrieving a paginated list of the currently logged in user's outgoing scrimmage requests.
 */
export const useScrimmageOutboxList = (
  { episodeId, page }: CompeteRequestOutboxListRequest,
  queryClient: QueryClient,
): UseQueryResult<PaginatedScrimmageRequestList, Error> =>
  useQuery({
    queryKey: competeQueryKeys.outbox({ episodeId, page }),
    queryFn: async () => {
      const result = await getUserScrimmagesOutboxList({ episodeId, page });

      // Prefetch the next page if it exists
      if (isPresent(result.next)) {
        // If no page provided, then we just fetched page 1
        const nextPage = isPresent(page) ? page + 1 : 2;
        // TODO: ensure correct prefetching behavior!
        queryClient
          .prefetchQuery({
            queryKey: competeQueryKeys.outbox({
              episodeId,
              page: nextPage,
            }),
            queryFn: async () =>
              await getUserScrimmagesOutboxList({ episodeId, page: nextPage }),
          })
          .catch((e) => toast.error((e as Error).message));
      }
      return result;
    },
  });

/**
 * For retrieving a paginated list of the given logged in user's team's past scrimmages.
 */
export const useUserScrimmageList = (
  { episodeId, page }: CompeteMatchScrimmageListRequest,
  queryClient: QueryClient,
): UseQueryResult<PaginatedMatchList, Error> =>
  useQuery({
    queryKey: competeQueryKeys.scrimsMeList({ episodeId, page }),
    queryFn: async () => {
      const result = await getScrimmagesListByTeam({ episodeId, page });

      // Prefetch the next page if it exists
      if (isPresent(result.next)) {
        // If no page provided, then we just fetched page 1
        const nextPage = isPresent(page) ? page + 1 : 2;
        // TODO: ensure correct prefetching behavior!
        queryClient
          .prefetchQuery({
            queryKey: competeQueryKeys.scrimsMeList({
              episodeId,
              page: nextPage,
            }),
            queryFn: async () =>
              await getScrimmagesListByTeam({ episodeId, page: nextPage }),
          })
          .catch((e) => toast.error((e as Error).message));
      }
      return result;
    },
  });

/**
 * For retrieving a paginated list of the given team's past scrimmages.
 */
export const useTeamScrimmageList = (
  { episodeId, teamId, page }: CompeteMatchScrimmageListRequest,
  queryClient: QueryClient,
): UseQueryResult<PaginatedMatchList, Error> =>
  useQuery({
    queryKey: competeQueryKeys.scrimsOtherList({ episodeId, teamId, page }),
    queryFn: async () => {
      const result = await getScrimmagesListByTeam({ episodeId, teamId, page });

      // Prefetch the next page if it exists
      if (isPresent(result.next)) {
        // If no page provided, then we just fetched page 1
        const nextPage = isPresent(page) ? page + 1 : 2;
        // TODO: ensure correct prefetching behavior!
        queryClient
          .prefetchQuery({
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
          })
          .catch((e) => toast.error((e as Error).message));
      }
      return result;
    },
  });

/**
 * For retrieving a paginated list of the matches in a given episode.
 */
export const useMatchList = (
  { episodeId, page }: CompeteMatchListRequest,
  queryClient: QueryClient,
): UseQueryResult<PaginatedMatchList, Error> =>
  useQuery({
    queryKey: competeQueryKeys.matchList({ episodeId, page }),
    queryFn: async () => {
      const result = await getMatchesList({ episodeId, page });

      // Prefetch the next page if it exists
      if (isPresent(result.next)) {
        // If no page provided, then we just fetched page 1
        const nextPage = isPresent(page) ? page + 1 : 2;
        // TODO: ensure correct prefetching behavior!
        queryClient
          .prefetchQuery({
            queryKey: competeQueryKeys.matchList({
              episodeId,
              page: nextPage,
            }),
            queryFn: async () =>
              await getMatchesList({ episodeId, page: nextPage }),
          })
          .catch((e) => toast.error((e as Error).message));
      }
      return result;
    },
  });

/**
 * For retrieving a paginated list of the matches in a given tournament.
 */
export const useTournamentMatchList = (
  {
    episodeId,
    teamId,
    tournamentId,
    roundId,
    page,
  }: CompeteMatchTournamentListRequest,
  queryClient: QueryClient,
): UseQueryResult<PaginatedMatchList, Error> =>
  useQuery({
    queryKey: competeQueryKeys.tourneyMatchList({
      episodeId,
      teamId,
      tournamentId,
      roundId,
      page,
    }),
    queryFn: async () => {
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
        queryClient
          .prefetchQuery({
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
          })
          .catch((e) => toast.error((e as Error).message));
      }
      return result;
    },
  });

// ---------- MUTATION HOOKS ---------- //
/**
 * For uploading a new submission.
 */
export const useUploadSubmission = (
  {
    episodeId,
  }: {
    episodeId: string;
  },
  queryClient: QueryClient,
): UseMutationResult<
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
      const toastFn = async (): Promise<Submission> => {
        const result = await uploadSubmission({
          episodeId,
          _package,
          description,
          sourceCode,
        });

        // Invalidate all submissions queries
        queryClient
          .invalidateQueries({
            queryKey: competeQueryKeys.subBase({ episodeId }),
          })
          .catch((e) => toast.error((e as Error).message));

        // Prefetch the first page of the submissions list
        queryClient
          .prefetchQuery({
            queryKey: competeQueryKeys.subList({ episodeId, page: 1 }),
            queryFn: async () =>
              await getSubmissionsList({ episodeId, page: 1 }),
          })
          .catch((e) => toast.error((e as Error).message));

        return result;
      };

      return await toast.promise(toastFn(), {
        loading: "Uploading submission...",
        success: "Submission uploaded!",
        error: "Error uploading submission.",
      });
    },
  });

/**
 * For requesting a scrimmage.
 */
export const useRequestScrimmage = (
  {
    episodeId,
  }: {
    episodeId: string;
  },
  queryClient: QueryClient,
): UseMutationResult<
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
      const toastFn = async (): Promise<ScrimmageRequest> => {
        const result = await requestScrimmage({
          episodeId,
          scrimmageRequestRequest,
        });

        // Invalidate the outbox query
        queryClient
          .invalidateQueries({
            queryKey: competeQueryKeys.outbox({ episodeId }),
          })
          .catch((e) => toast.error((e as Error).message));

        // Prefetch the first page of the outbox list
        queryClient
          .prefetchQuery({
            queryKey: competeQueryKeys.outbox({ episodeId, page: 1 }),
            queryFn: async () =>
              await getUserScrimmagesOutboxList({ episodeId, page: 1 }),
          })
          .catch((e) => toast.error((e as Error).message));

        return result;
      };

      return await toast.promise(toastFn(), {
        loading: "Requesting scrimmage...",
        success: "Scrimmage requested!",
        error: "Error requesting scrimmage. Is the requested team eligible?",
      });
    },
  });

/**
 * For accepting a scrimmage request.
 */
export const useAcceptScrimmage = (
  {
    episodeId,
  }: {
    episodeId: string;
  },
  queryClient: QueryClient,
): UseMutationResult<void, Error, CompeteRequestAcceptCreateRequest, unknown> =>
  useMutation({
    mutationKey: competeMutationKeys.acceptScrim({ episodeId }),
    mutationFn: async ({
      episodeId,
      id,
    }: CompeteRequestAcceptCreateRequest) => {
      const toastFn = async (): Promise<void> => {
        await acceptScrimmage({ episodeId, id });

        // Invalidate the inbox query
        // TODO: ensure correct invalidation behavior!
        queryClient
          .invalidateQueries({
            queryKey: competeQueryKeys.inbox({ episodeId }),
          })
          .catch((e) => toast.error((e as Error).message));

        // Prefetch the first page of the inbox list
        queryClient
          .prefetchQuery({
            queryKey: competeQueryKeys.inbox({ episodeId, page: 1 }),
            queryFn: async () =>
              await getUserScrimmagesInboxList({ episodeId, page: 1 }),
          })
          .catch((e) => toast.error((e as Error).message));
      };

      await toast.promise(toastFn(), {
        loading: "Accepting scrimmage...",
        success: "Scrimmage accepted!",
        error: "Error accepting scrimmage.",
      });
    },
  });

/**
 * For rejecting a scrimmage request.
 */
export const useRejectScrimmage = (
  {
    episodeId,
  }: {
    episodeId: string;
  },
  queryClient: QueryClient,
): UseMutationResult<void, Error, CompeteRequestRejectCreateRequest, unknown> =>
  useMutation({
    mutationKey: competeMutationKeys.rejectScrim({ episodeId }),
    mutationFn: async ({
      episodeId,
      id,
    }: CompeteRequestRejectCreateRequest) => {
      const toastFn = async (): Promise<void> => {
        await rejectScrimmage({ episodeId, id });

        // Invalidate the inbox query
        queryClient
          .invalidateQueries({
            queryKey: competeQueryKeys.inbox({ episodeId }),
          })
          .catch((e) => toast.error((e as Error).message));

        // Prefetch the first page of the inbox list
        queryClient
          .prefetchQuery({
            queryKey: competeQueryKeys.inbox({ episodeId, page: 1 }),
            queryFn: async () =>
              await getUserScrimmagesInboxList({ episodeId, page: 1 }),
          })
          .catch((e) => toast.error((e as Error).message));
      };

      await toast.promise(toastFn(), {
        loading: "Rejecting scrimmage...",
        success: "Scrimmage rejected!",
        error: "Error rejecting scrimmage.",
      });
    },
  });

/**
 * For cancelling a scrimmage request.
 */
export const useCancelScrimmage = (
  { episodeId }: { episodeId: string },
  queryClient: QueryClient,
): UseMutationResult<void, Error, CompeteRequestDestroyRequest, unknown> =>
  useMutation({
    mutationKey: competeMutationKeys.cancelScrim({ episodeId }),
    mutationFn: async ({ episodeId, id }: CompeteRequestDestroyRequest) => {
      const toastFn = async (): Promise<void> => {
        await cancelScrimmage({ episodeId, id });

        // Invalidate the outbox query
        queryClient
          .invalidateQueries({
            queryKey: competeQueryKeys.outbox({ episodeId }),
          })
          .catch((e) => toast.error((e as Error).message));

        // Prefetch the first page of the outbox list
        queryClient
          .prefetchQuery({
            queryKey: competeQueryKeys.outbox({ episodeId, page: 1 }),
            queryFn: async () =>
              await getUserScrimmagesOutboxList({ episodeId, page: 1 }),
          })
          .catch((e) => toast.error((e as Error).message));
      };

      await toast.promise(toastFn(), {
        loading: "Cancelling scrimmage...",
        success: "Scrimmage cancelled!",
        error: "Error cancelling scrimmage.",
      });
    },
  });
