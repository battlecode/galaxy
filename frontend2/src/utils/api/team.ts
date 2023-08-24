import {
  TeamApi,
  type TeamJoinRequest,
  type TeamCreate,
  type PaginatedTeamPublicList,
  type TeamTListRequest,
} from "../types";
import { DEFAULT_API_CONFIGURATION } from "./constants";

/** This file contains all frontend user api functions. */
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
