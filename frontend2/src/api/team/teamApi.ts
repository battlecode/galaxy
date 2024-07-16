import {
  TeamApi,
  type TeamCreate,
  type PaginatedTeamPublicList,
  type TeamTListRequest,
  type TeamTAvatarCreateRequest,
  type TeamPrivate,
  type TeamTJoinCreateRequest,
  type TeamTLeaveCreateRequest,
  type TeamTMeRetrieveRequest,
  type TeamTMePartialUpdateRequest,
  type TeamRequirementReportUpdateRequest,
  type TeamTRetrieveRequest,
  type TeamPublic,
} from "../_autogen";
import { DEFAULT_API_CONFIGURATION } from "../helpers";

/** This file contains all frontend team api functions. */
const API = new TeamApi(DEFAULT_API_CONFIGURATION);

/**
 * Creates a new team.
 * @param episodeId The episode of the team to be created.
 * @param name The name of the team.
 */
export const createTeam = async ({
  episodeId,
  name,
}: {
  episodeId: string;
  name: string;
}): Promise<TeamCreate> =>
  await API.teamTCreate({
    episodeId,
    teamCreateRequest: {
      episode: episodeId,
      name,
    },
  });

/**
 * Join the team with the given join key & name.
 * @param episodeId The episode of the team to join.
 * @param teamJoinRequest The team's join key & name.
 */
export const joinTeam = async ({
  episodeId,
  teamJoinRequest,
}: TeamTJoinCreateRequest): Promise<void> => {
  await API.teamTJoinCreate({ episodeId, teamJoinRequest });
};

/**
 * Leave the user's current team in a given episode.
 * @param episodeId The given episode's ID.
 */
export const leaveTeam = async ({
  episodeId,
}: TeamTLeaveCreateRequest): Promise<void> => {
  await API.teamTLeaveCreate({ episodeId });
};

/**
 * Get the current user's team for an episode.
 * @param episodeId The episode of the team to retrieve.
 */
export const getUserTeamInfo = async ({
  episodeId,
}: TeamTMeRetrieveRequest): Promise<TeamPrivate> =>
  await API.teamTMeRetrieve({ episodeId });

/**
 * Get a team's info by its ID.
 * @param episodeId The episode of the team to retrieve.
 * @param id The team's ID.
 */
export const getTeamInfo = async ({
  episodeId,
  id,
}: TeamTRetrieveRequest): Promise<TeamPublic> =>
  await API.teamTRetrieve({
    episodeId,
    id,
  });

/**
 * Push a partial update to the current user's team for a specific episode.
 * The current user must be on a team in the provided episode.
 * @param episodeId The episode of the team
 * @param patchedTeamPrivateRequest The partial team update
 * @returns The updated TeamPrivate object
 */
export const updateTeamPartial = async ({
  episodeId,
  patchedTeamPrivateRequest,
}: TeamTMePartialUpdateRequest): Promise<TeamPrivate> =>
  await API.teamTMePartialUpdate({
    episodeId,
    patchedTeamPrivateRequest,
  });

// -- TEAM STATS --//

// TODO: implement rankings history
// /**
//  * Get the Mu history of the given team.
//  * @param teamId The team's ID.
//  */
// export const getTeamMuHistoryByTeam = async (teamId: number) => {
//   return await $.get(`${baseUrl}/api/${LEAGUE}/team/${teamId}/history/`);
// };

/**
 * getTeamMuHistoryByTeam
 */

/**
 * getTeamWinStatsByTeam
 */

/**
 * getUserTeamWinStats
 */

/**
 * getTeamInfoByTeam
 */

/**
 * getTeamRankingByTeam
 */

/**
 * Search team, ordering the result by ranking.
 * @param episodeId The current episode's ID.
 * @param search The search query.
 * @param page The page number.
 */
export const searchTeams = async ({
  episodeId,
  search,
  page,
}: TeamTListRequest): Promise<PaginatedTeamPublicList> =>
  await API.teamTList({
    episodeId,
    ordering: "-rating,name",
    search,
    page,
  });

/**
 * Upload a new avatar for the currently logged in user's team.
 * @param episodeId The current episode's ID.
 * @param teamAvatarRequest The avatar file.
 */
export const teamAvatarUpload = async (teamAvatarRequest: TeamTAvatarCreateRequest): Promise<void> => {
  await API.teamTAvatarCreate(teamAvatarRequest);
};

/**
 * Upload a new report for the currently logged in user's team.
 * @param episodeId The current episode's ID.
 * @param reportFile The report file.
 */
export const uploadUserTeamReport = async ({
  episodeId,
  teamReportRequest,
}: TeamRequirementReportUpdateRequest): Promise<void> => {
  await API.teamRequirementReportUpdate({
    episodeId,
    teamReportRequest,
  });
};
