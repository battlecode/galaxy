import {
  CompeteApi,
  type TournamentSubmission,
  type PaginatedSubmissionList,
  type PaginatedScrimmageRequestList,
  type ScrimmageRequestRequest,
  type PlayerOrderEnum,
  type PaginatedMatchList,
} from "../types";
import { DEFAULT_API_CONFIGURATION, downloadFile } from "./helpers";

/** This file contains all frontend compete functions.
 * Note that "scrimmage" refers to a match that does not belong to a tournament.
 */
const API = new CompeteApi(DEFAULT_API_CONFIGURATION);

/**
 * Uploads a new submission to the Google Cloud Storage bucket.
 * @param episodeId The current episode's ID.
 * @param submission The submission's info.
 */
export const uploadSubmission = async (
  episodeId: string,
  submission: {
    file: File;
    packageName: string;
    description: string;
  },
): Promise<void> => {
  await API.competeSubmissionCreate({
    episodeId,
    submissionRequest: {
      source_code: submission.file,
      _package: submission.packageName,
      description: submission.description,
    },
  });
};

/**
 * Download a submission from the Google Cloud Storage bucket.
 * @param episodeId The current episode's ID.
 * @param submissionId The submission's ID.
 */
export const downloadSubmission = async (
  episodeId: string,
  submissionId: number,
): Promise<void> => {
  // the url where the submission is located
  const url: string = (
    await API.competeSubmissionDownloadRetrieve({
      episodeId,
      id: submissionId.toString(),
    })
  ).url;

  await downloadFile(url, `battlecode_source_${submissionId}.zip`);
};

/**
 * Get all submissions.
 * @param episodeId The current episode's ID.
 * @param page The page number.
 */
export const getAllSubmissions = async (
  episodeId: string,
  page?: number,
): Promise<PaginatedSubmissionList> => {
  return await API.competeSubmissionList({ episodeId, page });
};

/**
 * Get all tournament submissions for the currently logged in user's team.
 * @param episodeId The current episode's ID.
 */
export const getAllUserTournamentSubmissions = async (
  episodeId: string,
): Promise<TournamentSubmission[]> => {
  return await API.competeSubmissionTournamentList({ episodeId });
};

/**
 * Accept a scrimmage invitation.
 * @param episodeId The current episode's ID.
 * @param scrimmageId The scrimmage's ID to accept.
 */
export const acceptScrimmage = async (
  episodeId: string,
  scrimmageId: number,
): Promise<void> => {
  const scrimId = scrimmageId.toString();
  await API.competeRequestAcceptCreate({ episodeId, id: scrimId });
};

/**
 * Reject a scrimmage invitation.
 * @param episodeId The current episode's ID.
 * @param scrimmageId The scrimmage's ID to reject.
 */
export const rejectScrimmage = async (
  episodeId: string,
  scrimmageId: number,
): Promise<void> => {
  const scrimId = scrimmageId.toString();
  await API.competeRequestRejectCreate({ episodeId, id: scrimId });
};

/**
 * Get all of the currently logged in user's incoming scrimmage requests.
 * @param episodeId The current episode's ID.
 */
export const getUserScrimmagesInbox = async (
  episodeId: string,
  page?: number,
): Promise<PaginatedScrimmageRequestList> => {
  return await API.competeRequestInboxList({ episodeId, page });
};

/**
 * Get all of the currently logged in user's outgoing scrimmage requests.
 * @param episodeId The current episode's ID.
 */
export const getUserScrimmagesOutbox = async (
  episodeId: string,
  page?: number,
): Promise<PaginatedScrimmageRequestList> => {
  return await API.competeRequestOutboxList({ episodeId, page });
};

/**
 * Request a scrimmage with a team.
 * @param episodeId The current episode's ID.
 * @param request The scrimmage request body.
 */
export const requestScrimmage = async (
  episodeId: string,
  request: {
    isRanked: boolean;
    requestedTo: number;
    playerOrder: PlayerOrderEnum;
    mapNames: string[];
  },
): Promise<void> => {
  const scrimmageRequest: ScrimmageRequestRequest = {
    is_ranked: request.isRanked,
    requested_to: request.requestedTo,
    player_order: request.playerOrder,
    map_names: request.mapNames,
  };
  await API.competeRequestCreate({
    episodeId,
    scrimmageRequestRequest: scrimmageRequest,
  });
};

/**
 * Get all of the scrimmages (non-tournament matches) that a given team has played.
 * If teamId is not specified, defaults to the logged in user's team.
 * @param episodeId The current episode's ID.
 * @param teamId The team's ID. Defaults to the logged in user's team.
 * @param page The page of scrimmages to get.
 */
export const getScrimmagesByTeam = async (
  episodeId: string,
  teamId?: number,
  page?: number,
): Promise<PaginatedMatchList> => {
  return await API.competeMatchScrimmageList({ episodeId, teamId, page });
};

/**
 * Get all of the tournament matches of an episode,
 * optionally filtered by tournament, round and/or team.
 * @param episodeId The current episode's ID.
 * @param teamId The team's ID.
 * @param tournamentId The tournament's ID.
 * @param roundId The tournament round's ID.
 * @param page The page of matches to get.
 */
export const getTournamentMatches = async (
  episodeId: string,
  teamId?: number,
  tournamentId?: string,
  roundId?: number,
  page?: number,
): Promise<PaginatedMatchList> => {
  return await API.competeMatchTournamentList({
    episodeId,
    page,
    roundId,
    teamId,
    tournamentId,
  });
};

/**
 * Get all of the matches played in the given episode. Includes both tournament
 * matches and scrimmages.
 * @param episodeId The current episode's ID.
 * @param page The page of matches to get.
 */
export const getAllMatches = async (
  episodeId: string,
  page?: number,
): Promise<PaginatedMatchList> => {
  return await API.competeMatchList({ episodeId, page });
};
