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
  CompeteMatchHistoricalRatingListRequest,
  CompeteMatchListRequest,
  CompeteMatchScrimmageListRequest,
  CompeteMatchScrimmagingRecordRetrieveRequest,
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
  CompeteSubmissionDownloadRetrieveRequest,
  HistoricalRating,
  PaginatedMatchList,
  PaginatedScrimmageRequestList,
  PaginatedSubmissionList,
  PaginatedTeamPublicList,
  ResponseError,
  ScrimmageRecord,
  ScrimmageRequest,
  Submission,
  TournamentSubmission,
} from "../_autogen";
import {
  acceptScrimmage,
  cancelScrimmage,
  rejectScrimmage,
  requestScrimmage,
  uploadSubmission,
  downloadSubmission,
} from "./competeApi";
import toast from "react-hot-toast";
import { buildKey } from "../helpers";
import {
  matchListFactory,
  ratingHistoryMeFactory,
  ratingHistoryTopFactory,
  scrimmageInboxListFactory,
  scrimmageOutboxListFactory,
  scrimmagingRecordFactory,
  subsListFactory,
  teamScrimmageListFactory,
  tournamentMatchListFactory,
  tournamentSubsListFactory,
  userScrimmageListFactory,
} from "./competeFactories";
import { searchTeamsFactory } from "api/team/teamFactories";
import { isPresent } from "utils/utilTypes";

// ---------- QUERY HOOKS ---------- //
/**
 * For retrieving a list of the currently logged in user's submissions.
 */
export const useSubmissionsList = (
  { episodeId, page }: CompeteSubmissionListRequest,
  queryClient: QueryClient,
): UseQueryResult<PaginatedSubmissionList, Error> =>
  useQuery({
    queryKey: buildKey(subsListFactory.queryKey, { episodeId, page }),
    queryFn: async () =>
      await subsListFactory.queryFn({ episodeId, page }, queryClient, true),
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
    queryKey: buildKey(tournamentSubsListFactory.queryKey, { episodeId }),
    queryFn: async () => await tournamentSubsListFactory.queryFn({ episodeId }),
  });

/**
 * For retrieving a paginated list of the currently logged in user's incoming scrimmage requests.
 */
export const useScrimmageInboxList = (
  { episodeId, page }: CompeteRequestInboxListRequest,
  queryClient: QueryClient,
): UseQueryResult<PaginatedScrimmageRequestList, Error> =>
  useQuery({
    queryKey: buildKey(scrimmageInboxListFactory.queryKey, { episodeId, page }),
    queryFn: async () =>
      await scrimmageInboxListFactory.queryFn(
        { episodeId, page },
        queryClient,
        true,
      ),
  });

/**
 * For retrieving a paginated list of the currently logged in user's outgoing scrimmage requests.
 */
export const useScrimmageOutboxList = (
  { episodeId, page }: CompeteRequestOutboxListRequest,
  queryClient: QueryClient,
): UseQueryResult<PaginatedScrimmageRequestList, Error> =>
  useQuery({
    queryKey: buildKey(scrimmageOutboxListFactory.queryKey, {
      episodeId,
      page,
    }),
    queryFn: async () =>
      await scrimmageOutboxListFactory.queryFn(
        { episodeId, page },
        queryClient,
        true,
      ),
  });

/**
 * For retrieving a paginated list of the given logged in user's team's past scrimmages.
 */
export const useUserScrimmageList = (
  { episodeId, page }: CompeteMatchScrimmageListRequest,
  queryClient: QueryClient,
): UseQueryResult<PaginatedMatchList, Error> =>
  useQuery({
    queryKey: buildKey(userScrimmageListFactory.queryKey, { episodeId, page }),
    queryFn: async () =>
      await userScrimmageListFactory.queryFn(
        { episodeId, page },
        queryClient,
        true,
      ),
  });

/**
 * For retrieving a paginated list of the given team's past scrimmages.
 */
export const useTeamScrimmageList = (
  { episodeId, teamId, page }: CompeteMatchScrimmageListRequest,
  queryClient: QueryClient,
): UseQueryResult<PaginatedMatchList, Error> =>
  useQuery({
    queryKey: buildKey(teamScrimmageListFactory.queryKey, {
      episodeId,
      teamId,
      page,
    }),
    queryFn: async () =>
      await teamScrimmageListFactory.queryFn(
        { episodeId, teamId, page },
        queryClient,
        true,
      ),
  });

/**
 * For retrieving a paginated list of the matches in a given episode.
 */
export const useMatchList = (
  { episodeId, page }: CompeteMatchListRequest,
  queryClient: QueryClient,
): UseQueryResult<PaginatedMatchList, Error> =>
  useQuery({
    queryKey: buildKey(matchListFactory.queryKey, { episodeId, page }),
    queryFn: async () =>
      await matchListFactory.queryFn({ episodeId, page }, queryClient, true),
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
    queryKey: buildKey(tournamentMatchListFactory.queryKey, {
      episodeId,
      teamId,
      tournamentId,
      roundId,
      page,
    }),
    queryFn: async () =>
      await tournamentMatchListFactory.queryFn(
        { episodeId, teamId, tournamentId, roundId, page },
        queryClient,
        true,
      ),
  });

/**
 * For retrieving a list of the top 10 teams' historical ratings in a given episode.
 */
export const useTopRatingHistoryList = (
  { episodeId }: CompeteMatchHistoricalRatingListRequest,
  queryClient: QueryClient,
): UseQueryResult<HistoricalRating[], Error> =>
  useQuery({
    queryKey: buildKey(ratingHistoryTopFactory.queryKey, { episodeId }),
    queryFn: async () => {
      // Get the query data for the top 10 teams in this episode
      const topTeamsData: PaginatedTeamPublicList | undefined =
        await queryClient.ensureQueryData({
          queryKey: buildKey(searchTeamsFactory.queryKey, { episodeId }),
          queryFn: async () =>
            await searchTeamsFactory.queryFn(
              { episodeId, page: 1 },
              queryClient,
              false, // We don't want to prefetch teams 11-20
            ),
        });
      // Fetch their rating histories
      if (isPresent(topTeamsData) && isPresent(topTeamsData.results)) {
        const topTeamsIds = topTeamsData.results.map((team) => team.id);
        return await ratingHistoryTopFactory.queryFn({
          episodeId,
          teamIds: topTeamsIds,
        });
      } else {
        return [];
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

/**
 * For retrieving a list of the currently logged in user's team's historical rating in a given episode.
 */
export const useUserRatingHistoryList = ({
  episodeId,
}: CompeteMatchHistoricalRatingListRequest): UseQueryResult<
  HistoricalRating[],
  Error
> =>
  useQuery({
    queryKey: buildKey(ratingHistoryMeFactory.queryKey, { episodeId }),
    queryFn: async () => await ratingHistoryMeFactory.queryFn({ episodeId }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

/**
 * For retrieving the given team's scrimmaging record in a given episode. Defaults to the currently logged in user's team.
 */
export const useScrimmagingRecord = ({
  episodeId,
  teamId,
  scrimmageType,
}: CompeteMatchScrimmagingRecordRetrieveRequest): UseQueryResult<
  ScrimmageRecord,
  Error
> =>
  useQuery({
    queryKey: buildKey(scrimmagingRecordFactory.queryKey, {
      episodeId,
      teamId,
      scrimmageType,
    }),
    queryFn: async () =>
      await scrimmagingRecordFactory.queryFn({
        episodeId,
        teamId,
        scrimmageType,
      }),
    staleTime: 1000 * 30, // 30 seconds
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

        try {
          // Invalidate all submissions queries
          await queryClient.invalidateQueries({
            queryKey: buildKey(competeQueryKeys.subBase, { episodeId }),
          });
          // Then prefetch the first page of the submissions list
          await queryClient.prefetchQuery({
            queryKey: buildKey(subsListFactory.queryKey, {
              episodeId,
              page: 1,
            }),
            queryFn: async () =>
              await subsListFactory.queryFn(
                { episodeId, page: 1 },
                queryClient,
                true,
              ),
          });
        } catch (e) {
          toast.error((e as ResponseError).message);
        }

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
  onSuccess?: () => void,
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

        try {
          // Invalidate the outbox query
          await queryClient.invalidateQueries({
            queryKey: buildKey(scrimmageOutboxListFactory.queryKey, {
              episodeId,
            }),
          });
          // Prefetch the first page of the outbox list
          await queryClient.prefetchQuery({
            queryKey: buildKey(scrimmageOutboxListFactory.queryKey, {
              episodeId,
              page: 1,
            }),
            queryFn: async () =>
              await scrimmageOutboxListFactory.queryFn(
                { episodeId, page: 1 },
                queryClient,
                true,
              ),
          });
        } catch (e) {
          toast.error((e as ResponseError).message);
        }

        return result;
      };

      return await toast.promise(toastFn(), {
        loading: "Requesting scrimmage...",
        success: "Scrimmage requested!",
        error: "Error requesting scrimmage. Is the requested team eligible?",
      });
    },
    onSuccess,
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

        try {
          // Invalidate the inbox query
          await queryClient.invalidateQueries({
            queryKey: buildKey(scrimmageInboxListFactory.queryKey, {
              episodeId,
            }),
          });
          // Prefetch the first page of the inbox list
          await queryClient.prefetchQuery({
            queryKey: buildKey(scrimmageInboxListFactory.queryKey, {
              episodeId,
              page: 1,
            }),
            queryFn: async () =>
              await scrimmageInboxListFactory.queryFn(
                { episodeId, page: 1 },
                queryClient,
                true,
              ),
          });
        } catch (e) {
          toast.error((e as ResponseError).message);
        }
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

        try {
          // Invalidate the inbox query
          await queryClient.invalidateQueries({
            queryKey: buildKey(scrimmageInboxListFactory.queryKey, {
              episodeId,
            }),
          });

          // Prefetch the first page of the inbox list
          await queryClient.prefetchQuery({
            queryKey: buildKey(scrimmageInboxListFactory.queryKey, {
              episodeId,
              page: 1,
            }),
            queryFn: async () =>
              await scrimmageInboxListFactory.queryFn(
                { episodeId, page: 1 },
                queryClient,
                true,
              ),
          });
        } catch (e) {
          toast.error((e as ResponseError).message);
        }
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
            queryKey: buildKey(scrimmageOutboxListFactory.queryKey, {
              episodeId,
            }),
          })
          .catch((e) => toast.error((e as Error).message));

        // Prefetch the first page of the outbox list
        queryClient
          .prefetchQuery({
            queryKey: buildKey(scrimmageOutboxListFactory.queryKey, {
              episodeId,
              page: 1,
            }),
            queryFn: async () =>
              await scrimmageOutboxListFactory.queryFn(
                { episodeId, page: 1 },
                queryClient,
                true,
              ),
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

/**
 * For downloading a submission.
 */
export const useDownloadSubmission = ({
  episodeId,
}: {
  episodeId: string;
}): UseMutationResult<
  void,
  Error,
  CompeteSubmissionDownloadRetrieveRequest,
  unknown
> =>
  useMutation({
    mutationKey: competeMutationKeys.downloadSub({ episodeId }),
    mutationFn: async ({
      episodeId,
      id,
    }: CompeteSubmissionDownloadRetrieveRequest) => {
      await toast.promise(downloadSubmission({ episodeId, id }), {
        loading: "Downloading submission...",
        success: "Downloaded submission!",
        error: "Error downloading submission.",
      });
    },
  });
