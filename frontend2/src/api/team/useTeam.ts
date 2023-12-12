import {
  type UseQueryResult,
  useQuery,
  useMutation,
  useQueryClient,
  type UseMutationResult,
  type QueryClient,
} from "@tanstack/react-query";
import type {
  PaginatedTeamPublicList,
  PatchedTeamPrivateRequest,
  TeamAvatarRequest,
  TeamCreate,
  TeamJoinRequest,
  TeamPrivate,
  TeamPublic,
  TeamReportRequest,
  TeamRequirementReportUpdateRequest,
  TeamTAvatarCreateRequest,
  TeamTCreateRequest,
  TeamTJoinCreateRequest,
  TeamTLeaveCreateRequest,
  TeamTListRequest,
  TeamTMePartialUpdateRequest,
  TeamTMeRetrieveRequest,
  TeamTRetrieveRequest,
} from "../_autogen";
import { teamMutationKeys, teamQueryKeys } from "./teamKeys";
import {
  createTeam,
  getTeamInfo,
  getUserTeamInfo,
  joinTeam,
  leaveTeam,
  searchTeams,
  teamAvatarUpload,
  updateTeamPartial,
  uploadUserTeamReport,
} from "./teamApi";
import { toast } from "react-hot-toast";
import { isPresent } from "../../utils/utilTypes";

// ---------- QUERY HOOKS ---------- //
/**
 * For retrieving the current user's team for an episode.
 */
export const useUserTeam = ({
  episodeId,
}: TeamTMeRetrieveRequest): UseQueryResult<TeamPrivate, Error> =>
  useQuery({
    queryKey: teamQueryKeys.myTeam({ episodeId }),
    queryFn: async () => await getUserTeamInfo({ episodeId }),
  });

/**
 * For retrieving a team's info by its ID and episode id.
 */
export const useTeam = ({
  episodeId,
  id,
}: TeamTRetrieveRequest): UseQueryResult<TeamPublic, Error> =>
  useQuery({
    queryKey: teamQueryKeys.otherInfo({ episodeId, id }),
    queryFn: async () => await getTeamInfo({ episodeId, id }),
  });

/**
 * For searching the teams in an episode, ordered by ranking.
 */
export const useSearchTeams = (
  { episodeId, search, page }: TeamTListRequest,
  queryClient: QueryClient,
): UseQueryResult<PaginatedTeamPublicList, Error> =>
  useQuery({
    queryKey: teamQueryKeys.search({ episodeId, search, page }),
    queryFn: async () => {
      const result = await searchTeams({ episodeId, search, page });

      // Prefetch the next page if it exists
      if (isPresent(result.next)) {
        // If no page provided, then we just fetched page 1
        const nextPage = isPresent(page) ? page + 1 : 2;
        // TODO: ensure correct prefetching behavior!
        queryClient
          .prefetchQuery({
            queryKey: teamQueryKeys.search({
              episodeId,
              search,
              page: nextPage,
            }),
            queryFn: async () =>
              await searchTeams({ episodeId, search, page: nextPage }),
          })
          .catch((e) => toast.error((e as Error).message));
      }
      return result;
    },
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
  },
  unknown
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
      queryClient.setQueryData(teamQueryKeys.myTeam({ episodeId }), data);
    },
  });

/**
 * Join the team with the given join key & name.
 */
export const useJoinTeam = (
  { episodeId }: { episodeId: string },
  queryClient: QueryClient,
): UseMutationResult<void, Error, TeamJoinRequest, unknown> =>
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
      await queryClient.refetchQueries({
        queryKey: teamQueryKeys.myTeam({ episodeId }),
      });
    },
  });

/**
 * Leave the user's current team in a given episode.
 */
export const useLeaveTeam = (
  { episodeId }: { episodeId: string },
  queryClient: QueryClient,
): UseMutationResult<void, Error, void, unknown> =>
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
      await queryClient.invalidateQueries({
        queryKey: teamQueryKeys.myTeam({ episodeId }),
      });
    },
  });

/**
 * Update the current user's team for a specific episode.
 */
export const useUpdateTeam = (
  { episodeId }: { episodeId: string },
  queryClient: QueryClient,
): UseMutationResult<TeamPrivate, Error, PatchedTeamPrivateRequest, unknown> =>
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
      queryClient.setQueryData(teamQueryKeys.myTeam({ episodeId }), data);
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
): UseMutationResult<void, Error, TeamAvatarRequest, unknown> =>
  useMutation({
    mutationKey: teamMutationKeys.avatar({ episodeId }),
    mutationFn: async (teamAvatarRequest: TeamAvatarRequest) => {
      await toast.promise(teamAvatarUpload({ episodeId, teamAvatarRequest }), {
        loading: "Uploading team avatar...",
        success: "Uploaded team avatar!",
        error: "Error uploading team avatar.",
      });
    },
    onSuccess: async () => {
      await queryClient.refetchQueries({
        queryKey: teamQueryKeys.myTeam({ episodeId }),
      });
    },
  });

/**
 * Update the current user's team report for a specific episode.
 */
export const useUpdateTeamReport = (
  { episodeId }: { episodeId: string },
  queryClient: QueryClient,
): UseMutationResult<void, Error, TeamReportRequest, unknown> =>
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
        queryKey: teamQueryKeys.myTeam({ episodeId }),
      });
    },
  });
