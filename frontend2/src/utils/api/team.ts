import {
  TeamApi,
  type TeamJoinRequest,
  type TeamCreate,
  type PaginatedTeamPublicList,
  type TeamTListRequest,
  type TeamTAvatarCreateRequest,
  type TeamPrivate,
  type TeamProfilePrivateRequest,
} from "../types";
import { DEFAULT_API_CONFIGURATION } from "./helpers";

/** This file contains all frontend team api functions. */
const API = new TeamApi(DEFAULT_API_CONFIGURATION);

/**
 * Creates a new team.
 * @param teamName The name of the team.
 */
export const createTeam = async (
  episodeId: string,
  teamName: string,
): Promise<TeamCreate> => {
  return await API.teamTCreate({
    episodeId,
    teamCreateRequest: {
      episode: episodeId,
      name: teamName,
    },
  });
};

/**
 * Join the team with the given join key & name.
 * @param episodeId The current episode's ID.
 * @param teamName The team's name.
 * @param joinKey The team's join key.
 */
export const joinTeam = async (
  episodeId: string,
  teamName: string,
  joinKey: string,
): Promise<void> => {
  const teamJoinRequest: TeamJoinRequest = {
    name: teamName,
    join_key: joinKey,
  };
  await API.teamTJoinCreate({ episodeId, teamJoinRequest });
};

/**
 * Leave the user's current team.
 * @param episodeId The current episode's ID.
 */
export const leaveTeam = async (episodeId: string): Promise<void> => {
  await API.teamTLeaveCreate({ episodeId });
};

/**
 * Get the current user's team for an episode.
 * @param episodeId The episode of the team to retrieve.
 */
export const retrieveTeam = async (episodeId: string): Promise<TeamPrivate> => {
  return await API.teamTMeRetrieve({ episodeId });
};

/**
 * Push a partial update to the current user's team for a specific episode.
 * @param episodeId The episode of the team
 * @param teamProfilePrivateRequest The partial team update
 * @returns The updated TeamPrivate object
 */
export const updateTeamPartial = async (
  episodeId: string,
  teamProfilePrivateRequest: TeamProfilePrivateRequest,
): Promise<TeamPrivate> => {
  return await API.teamTMePartialUpdate({
    episodeId,
    patchedTeamPrivateRequest: { profile: teamProfilePrivateRequest },
  });
};

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
 * @param searchQuery The search query.
 * @param requireActiveSubmission Whether to require an active submission.
 * @param page The page number.
 */
export const searchTeams = async (
  episodeId: string,
  searchQuery: string,
  requireActiveSubmission: boolean,
  page?: number,
): Promise<PaginatedTeamPublicList> => {
  const request: TeamTListRequest = {
    episodeId,
    ordering: "-rating,name",
    search: searchQuery,
    page: page ?? 1,
  };
  return await API.teamTList(request);
};

/**
 * Upload a new avatar for the currently logged in user's team.
 * @param episodeId The current episode's ID.
 * @param avatarFile The avatar file.
 */
export const teamAvatarUpload = async (
  episodeId: string,
  avatarFile: File,
): Promise<void> => {
  const request: TeamTAvatarCreateRequest = {
    episodeId,
    teamAvatarRequest: {
      avatar: avatarFile,
    },
  };
  await API.teamTAvatarCreate(request);
};

/**
 * Upload a new report for the currently logged in user's team.
 * @param episodeId The current episode's ID.
 * @param reportFile The report file.
 */
export const uploadUserTeamReport = async (
  episodeId: string,
  reportFile: File,
): Promise<void> => {
  await API.teamRequirementReportUpdate({
    episodeId,
    teamReportRequest: {
      report: reportFile,
    },
  });
};
