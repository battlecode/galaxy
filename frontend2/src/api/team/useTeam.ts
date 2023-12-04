import {
  type UseQueryResult,
  useQuery,
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import type {
  PaginatedTeamPublicList,
  TeamCreate,
  TeamPrivate,
  TeamPublic,
  TeamRequirementReportUpdateRequest,
  TeamTAvatarCreateRequest,
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
    staleTime: 5 * 1000 * 60, // 5 minutes
  });

/**
 * For retrieving a team's info by its ID and episode id.
 */
export const useTeam = ({
  episodeId,
  id,
}: TeamTRetrieveRequest): UseQueryResult<TeamPublic, Error> =>
  useQuery({
    queryKey: teamQueryKeys.info({ episodeId, id }),
    queryFn: async () => await getTeamInfo({ episodeId, id }),
    staleTime: 5 * 1000 * 60, // 5 minutes
  });

/**
 * For searching the teams in an episode, ordered by ranking.
 */
export const useSearchTeams = ({
  episodeId,
  search,
  page,
}: TeamTListRequest): UseQueryResult<PaginatedTeamPublicList, Error> =>
  useQuery({
    queryKey: teamQueryKeys.search({ episodeId, search, page }),
    queryFn: async () => await searchTeams({ episodeId, search, page }),
    staleTime: 1000 * 60, // 1 minute
  });

// ---------- MUTATION HOOKS ---------- //
/**
 * Creates a team, and sets the current user's team to the newly created team.
 */
export const useCreateTeam = ({
  episodeId,
  name,
}: {
  episodeId: string;
  name: string;
}): UseMutationResult<TeamCreate, Error, void, unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: teamMutationKeys.create({ episodeId, name }),
    mutationFn: async () => await createTeam({ episodeId, name }),
    onSuccess: (data) => {
      queryClient.setQueryData(teamQueryKeys.myTeam({ episodeId }), data);
    },
  });
};

/**
 * Join the team with the given join key & name.
 */
export const useJoinTeam = ({
  episodeId,
  teamJoinRequest,
}: TeamTJoinCreateRequest): UseMutationResult<void, Error, void, unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: teamMutationKeys.join({ episodeId, teamJoinRequest }),
    mutationFn: async () => await joinTeam({ episodeId, teamJoinRequest }),
    onSuccess: (data) => {
      queryClient.setQueryData(teamQueryKeys.myTeam({ episodeId }), data);
    },
  });
};

/**
 * Leave the user's current team in a given episode.
 */
export const useLeaveTeam = ({
  episodeId,
}: TeamTLeaveCreateRequest): UseMutationResult<void, Error, void, unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: teamMutationKeys.leave({ episodeId }),
    mutationFn: async () => await leaveTeam({ episodeId }),
    onSuccess: () => {
      // use refetch instead of invalidate so we immediately load "no team"
      queryClient.refetchQueries({
        queryKey: teamQueryKeys.myTeam({ episodeId }),
      });
    },
  });
};

/**
 * Update the current user's team for a specific episode.
 */
export const useUpdateTeam = ({
  episodeId,
  patchedTeamPrivateRequest,
}: TeamTMePartialUpdateRequest): UseMutationResult<
  TeamPrivate,
  Error,
  TeamTMePartialUpdateRequest,
  unknown
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: teamMutationKeys.update({
      episodeId,
      patchedTeamPrivateRequest,
    }),
    mutationFn: async ({
      episodeId,
      patchedTeamPrivateRequest,
    }: TeamTMePartialUpdateRequest) =>
      await updateTeamPartial({ episodeId, patchedTeamPrivateRequest }),
    onSuccess: (data) => {
      queryClient.setQueryData(teamQueryKeys.myTeam({ episodeId }), data);
    },
  });
};

/**
 * Update the current user's team avatar for a specific episode.
 */
export const useUpdateTeamAvatar = ({
  episodeId,
  teamAvatarRequest,
}: TeamTAvatarCreateRequest): UseMutationResult<void, Error, void, unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: teamMutationKeys.avatar({ episodeId, teamAvatarRequest }),
    mutationFn: async () =>
      await teamAvatarUpload({ episodeId, teamAvatarRequest }),
    onSuccess: () => {
      queryClient.refetchQueries({
        queryKey: teamQueryKeys.myTeam({ episodeId }),
      });
    },
  });
};

/**
 * Update the current user's team report for a specific episode.
 */
export const useUpdateTeamReport = ({
  episodeId,
  teamReportRequest,
}: TeamRequirementReportUpdateRequest): UseMutationResult<
  void,
  Error,
  void,
  unknown
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: teamMutationKeys.report({ episodeId, teamReportRequest }),
    mutationFn: async () =>
      await uploadUserTeamReport({ episodeId, teamReportRequest }),
    onSuccess: () => {
      queryClient.refetchQueries({
        queryKey: teamQueryKeys.myTeam({ episodeId }),
      });
    },
  });
};
