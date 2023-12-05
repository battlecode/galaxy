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
import { toast } from "react-hot-toast";

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
    queryKey: teamQueryKeys.otherInfo({ episodeId, id }),
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
    mutationFn: async () =>
      await toast.promise(createTeam({ episodeId, name }), {
        loading: "Creating team...",
        success: (team) => `Created team ${team.name}!`,
        error: "Error creating team.",
      }),
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
    mutationFn: async () => {
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
    mutationFn: async () => {
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
    mutationFn: async () => {
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
};
