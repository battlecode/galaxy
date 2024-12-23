import {
  type UseQueryResult,
  useQuery,
  useMutation,
  type UseMutationResult,
  type QueryClient,
} from "@tanstack/react-query";
import type {
  PaginatedTeamPublicList,
  PatchedTeamPrivateRequest,
  TeamCreate,
  TeamJoinRequest,
  TeamPrivate,
  TeamPublic,
  TeamReportRequest,
  TeamTListRequest,
  TeamTMeRetrieveRequest,
  TeamTRetrieveRequest,
} from "../_autogen";
import { teamMutationKeys, teamQueryKeys } from "./teamKeys";
import {
  createTeam,
  joinTeam,
  leaveTeam,
  teamAvatarUpload,
  updateTeamPartial,
  uploadUserTeamReport,
} from "./teamApi";
import { toast } from "react-hot-toast";
import {
  myTeamFactory,
  otherTeamInfoFactory,
  searchTeamsFactory,
} from "./teamFactories";
import { buildKey } from "../helpers";
import { userRatingHistoryFactory } from "api/compete/competeFactories";
import { competeQueryKeys } from "api/compete/competeKeys";
import { MILLIS_SECOND } from "utils/utilTypes";

// ---------- QUERY HOOKS ---------- //
const SEARCH_WAIT_SECONDS = 30;

/**
 * For retrieving the current user's team for an episode.
 */
export const useUserTeam = ({
  episodeId,
}: TeamTMeRetrieveRequest): UseQueryResult<TeamPrivate> =>
  useQuery({
    queryKey: buildKey(myTeamFactory.queryKey, { episodeId }),
    queryFn: async () => await myTeamFactory.queryFn({ episodeId }),
  });

/**
 * For retrieving a team's info by its ID and episode id.
 */
export const useTeam = ({
  episodeId,
  id,
}: TeamTRetrieveRequest): UseQueryResult<TeamPublic> =>
  useQuery({
    queryKey: buildKey(otherTeamInfoFactory.queryKey, { episodeId, id }),
    queryFn: async () => await otherTeamInfoFactory.queryFn({ episodeId, id }),
  });

/**
 * For searching the teams in an episode, ordered by ranking.
 */
export const useSearchTeams = (
  { episodeId, search, page }: TeamTListRequest,
  queryClient: QueryClient,
): UseQueryResult<PaginatedTeamPublicList> =>
  useQuery({
    queryKey: buildKey(searchTeamsFactory.queryKey, {
      episodeId,
      search,
      page,
    }),
    queryFn: async () =>
      await searchTeamsFactory.queryFn(
        { episodeId, search, page },
        queryClient,
        true,
      ),
    staleTime: MILLIS_SECOND * SEARCH_WAIT_SECONDS,
  });

// ---------- MUTATION HOOKS ---------- //
/**
 * Creates a team, and sets the current user's team to the newly created team.
 */
export const useCreateTeam = (
  { episodeId }: { episodeId: string },
  queryClient: QueryClient,
): UseMutationResult<
  TeamCreate,
  Error,
  {
    name: string;
  }
> =>
  useMutation({
    mutationKey: teamMutationKeys.create({ episodeId }),
    mutationFn: async ({ name }: { name: string }) =>
      await toast.promise(createTeam({ episodeId, name }), {
        loading: "Creating team...",
        success: (team) => `Created team ${team.name}!`,
        error: "Error creating team.",
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(
        buildKey(myTeamFactory.queryKey, { episodeId }),
        data,
      );
    },
  });

/**
 * Join the team with the given join key & name.
 */
export const useJoinTeam = (
  { episodeId }: { episodeId: string },
  queryClient: QueryClient,
): UseMutationResult<void, Error, TeamJoinRequest> =>
  useMutation({
    mutationKey: teamMutationKeys.join({ episodeId }),
    mutationFn: async (teamJoinRequest: TeamJoinRequest) => {
      await toast.promise(joinTeam({ episodeId, teamJoinRequest }), {
        loading: "Joining team...",
        success: "Joined team!",
        error: "Error joining team.",
      });
    },
    onSuccess: async () => {
      // Refetch the user's team
      await queryClient.refetchQueries({
        queryKey: buildKey(myTeamFactory.queryKey, { episodeId }),
      });
      // Refetch the user's rating history
      await queryClient.refetchQueries({
        queryKey: buildKey(userRatingHistoryFactory.queryKey, { episodeId }),
      });
      // Refetch all scrimmage-related data
      await queryClient.refetchQueries({
        queryKey: competeQueryKeys.scrimBase.key({ episodeId }),
      });
    },
  });

/**
 * Leave the user's current team in a given episode.
 */
export const useLeaveTeam = (
  { episodeId }: { episodeId: string },
  queryClient: QueryClient,
  onSuccess?: () => void,
): UseMutationResult<void, Error, void> =>
  useMutation({
    mutationKey: teamMutationKeys.leave({ episodeId }),
    mutationFn: async () => {
      await toast.promise(leaveTeam({ episodeId }), {
        loading: "Leaving team...",
        success: "Left team!",
        error: "Error leaving team.",
      });
    },
    onSuccess: async () => {
      // Invalidate the user's team
      await queryClient.invalidateQueries({
        queryKey: buildKey(myTeamFactory.queryKey, { episodeId }),
      });
      // Invalidate the user's rating history
      await queryClient.invalidateQueries({
        queryKey: buildKey(userRatingHistoryFactory.queryKey, { episodeId }),
      });
      // Invalidate all scrimmage-related data
      await queryClient.invalidateQueries({
        queryKey: competeQueryKeys.scrimBase.key({ episodeId }),
      });
      if (onSuccess !== undefined) {
        onSuccess();
      }
    },
  });

/**
 * Update the current user's team for a specific episode.
 */
export const useUpdateTeam = (
  { episodeId }: { episodeId: string },
  queryClient: QueryClient,
): UseMutationResult<TeamPrivate, Error, PatchedTeamPrivateRequest> =>
  useMutation({
    mutationKey: teamMutationKeys.update({
      episodeId,
    }),
    mutationFn: async (patchedTeamPrivateRequest: PatchedTeamPrivateRequest) =>
      await toast.promise(
        updateTeamPartial({ episodeId, patchedTeamPrivateRequest }),
        {
          loading: "Updating team...",
          success: "Updated team!",
          error: "Error updating team.",
        },
      ),
    onSuccess: (data) => {
      queryClient.setQueryData(
        buildKey(myTeamFactory.queryKey, { episodeId }),
        data,
      );

      void queryClient.refetchQueries({
        queryKey: teamQueryKeys.teamBase.key({ episodeId }),
      });
    },
  });

/**
 * Update the current user's team avatar for a specific episode.
 */
export const useUpdateTeamAvatar = (
  {
    episodeId,
  }: {
    episodeId: string;
  },
  queryClient: QueryClient,
): UseMutationResult<void, Error, Blob> =>
  useMutation({
    mutationKey: teamMutationKeys.avatarUpload({ episodeId }),
    // We pass in a Blob because we already have the episodeId
    mutationFn: async (avatar: Blob) => {
      await toast.promise(teamAvatarUpload({ episodeId, avatar }), {
        loading: "Uploading team avatar...",
        success: "Uploaded team avatar!",
        error: "Error uploading team avatar.",
      });
    },
    onSuccess: async () => {
      await queryClient.refetchQueries({
        queryKey: buildKey(myTeamFactory.queryKey, { episodeId }),
      });
    },
  });

/**
 * Update the current user's team report for a specific episode.
 */
export const useUpdateTeamReport = (
  { episodeId }: { episodeId: string },
  queryClient: QueryClient,
): UseMutationResult<void, Error, TeamReportRequest> =>
  useMutation({
    mutationKey: teamMutationKeys.report({ episodeId }),
    mutationFn: async (teamReportRequest: TeamReportRequest) => {
      await toast.promise(
        uploadUserTeamReport({ episodeId, teamReportRequest }),
        {
          loading: "Uploading team report...",
          success: "Uploaded team report!",
          error: "Error uploading team report.",
        },
      );
    },
    onSuccess: async () => {
      await queryClient.refetchQueries({
        queryKey: buildKey(myTeamFactory.queryKey, { episodeId }),
      });
    },
  });
