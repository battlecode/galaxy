import type {
  TeamRequirementReportUpdateRequest,
  TeamTAvatarCreateRequest,
  TeamTJoinCreateRequest,
  TeamTLeaveCreateRequest,
  TeamTListRequest,
  TeamTMePartialUpdateRequest,
  TeamTMeRetrieveRequest,
  TeamTRetrieveRequest,
} from "../_autogen";

export const teamQueryKeys = {
  myTeam: ({ episodeId }: TeamTMeRetrieveRequest) =>
    ["team", "me", { episodeId }] as const,
  info: ({ episodeId, id }: TeamTRetrieveRequest) =>
    ["team", "info", { episodeId, id }] as const,
  search: ({ episodeId, search, page }: TeamTListRequest) =>
    ["team", "search", { episodeId, search, page }] as const,
};

export const teamMutationKeys = {
  create: ({ episodeId, name }: { episodeId: string; name: string }) =>
    ["team", "create", { episodeId, name }] as const,
  join: ({ episodeId, teamJoinRequest }: TeamTJoinCreateRequest) =>
    ["team", "join", { episodeId, teamJoinRequest }] as const,
  leave: ({ episodeId }: TeamTLeaveCreateRequest) =>
    ["team", "leave", { episodeId }] as const,
  update: ({
    episodeId,
    patchedTeamPrivateRequest,
  }: TeamTMePartialUpdateRequest) =>
    ["team", "update", { episodeId, patchedTeamPrivateRequest }] as const,
  avatar: ({ episodeId, teamAvatarRequest }: TeamTAvatarCreateRequest) =>
    ["team", "avatar", { episodeId, teamAvatarRequest }] as const,
  report: ({
    episodeId,
    teamReportRequest,
  }: TeamRequirementReportUpdateRequest) =>
    ["team", "report", { episodeId, teamReportRequest }] as const,
};
