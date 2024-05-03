import {
  CompeteApi,
  type TournamentSubmission,
  type PaginatedSubmissionList,
  type PaginatedScrimmageRequestList,
  type PaginatedMatchList,
  type CompeteSubmissionCreateRequest,
  type CompeteSubmissionDownloadRetrieveRequest,
  type CompeteSubmissionListRequest,
  type Submission,
  type CompeteRequestAcceptCreateRequest,
  type CompeteRequestRejectCreateRequest,
  type CompeteRequestInboxListRequest,
  type CompeteRequestOutboxListRequest,
  type CompeteRequestCreateRequest,
  type ScrimmageRequest,
  type CompeteMatchScrimmageListRequest,
  type CompeteMatchTournamentListRequest,
  type CompeteMatchListRequest,
  type CompeteSubmissionTournamentListRequest,
  type CompeteRequestDestroyRequest,
  type CompeteMatchHistoricalRatingListRequest,
  type HistoricalRating,
} from "../_autogen";
import { DEFAULT_API_CONFIGURATION, downloadFile } from "../helpers";

/** This file contains all frontend compete functions.
 * Note that "scrimmage" refers to a match that does not belong to a tournament.
 */
const API = new CompeteApi(DEFAULT_API_CONFIGURATION);

/**
 * Uploads a new submission to the Google Cloud Storage bucket.
 * @param episodeId The current episode's ID.
 * @param _package The name of the submission's package.
 * @param description The submission's description.
 * @param sourceCode The submission's source code.
 */
export const uploadSubmission = async ({
  episodeId,
  _package,
  description,
  sourceCode,
}: CompeteSubmissionCreateRequest): Promise<Submission> =>
  await API.competeSubmissionCreate({
    episodeId,
    sourceCode,
    _package,
    description,
  });

/**
 * Download a submission from the Google Cloud Storage bucket.
 * @param episodeId The current episode's ID.
 * @param id The submission's ID.
 */
export const downloadSubmission = async ({
  episodeId,
  id,
}: CompeteSubmissionDownloadRetrieveRequest): Promise<void> => {
  // TODO: use useMutationState to download submission from cache once its ready?
  // the url where the submission is located
  const url: string = (
    await API.competeSubmissionDownloadRetrieve({
      episodeId,
      id,
    })
  ).url;

  await downloadFile(url, `battlecode_source_${id}.zip`);
};

/**
 * Get a paginated list of all of the current user's team's submissions.
 * @param episodeId The current episode's ID.
 * @param page The page number.
 */
export const getSubmissionsList = async ({
  episodeId,
  page,
}: CompeteSubmissionListRequest): Promise<PaginatedSubmissionList> =>
  await API.competeSubmissionList({ episodeId, page });

/**
 * Get all tournament submissions for the currently logged in user's team.
 * @param episodeId The current episode's ID.
 */
export const getAllUserTournamentSubmissions = async ({
  episodeId,
}: CompeteSubmissionTournamentListRequest): Promise<TournamentSubmission[]> =>
  await API.competeSubmissionTournamentList({ episodeId });

/**
 * Accept a scrimmage invitation.
 * @param episodeId The current episode's ID.
 * @param id The scrimmage's ID to accept.
 */
export const acceptScrimmage = async ({
  episodeId,
  id,
}: CompeteRequestAcceptCreateRequest): Promise<void> => {
  await API.competeRequestAcceptCreate({ episodeId, id });
};

/**
 * Reject a scrimmage invitation.
 * @param episodeId The current episode's ID.
 * @param id The scrimmage's ID to reject.
 */
export const rejectScrimmage = async ({
  episodeId,
  id,
}: CompeteRequestRejectCreateRequest): Promise<void> => {
  await API.competeRequestRejectCreate({ episodeId, id });
};

/**
 * Cancel a scrimmage request.
 * @param episodeId The current episode's ID.
 * @param id The scrimmage's ID to cancel.
 */
export const cancelScrimmage = async ({
  episodeId,
  id,
}: CompeteRequestDestroyRequest): Promise<void> => {
  await API.competeRequestDestroy({ episodeId, id });
};

/**
 * Get a paginated list of the currently logged in user's incoming scrimmage requests.
 * @param episodeId The current episode's ID.
 * @param page The page number.
 */
export const getUserScrimmagesInboxList = async ({
  episodeId,
  page,
}: CompeteRequestInboxListRequest): Promise<PaginatedScrimmageRequestList> =>
  await API.competeRequestInboxList({ episodeId, page });

/**
 * Get a paginated list of the currently logged in user's outgoing scrimmage requests.
 * @param episodeId The current episode's ID.
 * @param page The page number.
 */
export const getUserScrimmagesOutboxList = async ({
  episodeId,
  page,
}: CompeteRequestOutboxListRequest): Promise<PaginatedScrimmageRequestList> =>
  await API.competeRequestOutboxList({ episodeId, page });

/**
 * Request a scrimmage with a team.
 * @param episodeId The current episode's ID.
 * @param scrimmageRequestRequest The scrimmage request body.
 */
export const requestScrimmage = async ({
  episodeId,
  scrimmageRequestRequest,
}: CompeteRequestCreateRequest): Promise<ScrimmageRequest> =>
  await API.competeRequestCreate({
    episodeId,
    scrimmageRequestRequest,
  });

/**
 * Get a paginated list of the scrimmages (non-tournament matches) that a given team has played.
 * If teamId is not specified, defaults to the logged in user's team.
 * @param episodeId The current episode's ID.
 * @param teamId The team's ID. Defaults to the logged in user's team.
 * @param page The page of scrimmages to get.
 */
export const getScrimmagesListByTeam = async ({
  episodeId,
  teamId,
  page,
}: CompeteMatchScrimmageListRequest): Promise<PaginatedMatchList> =>
  await API.competeMatchScrimmageList({ episodeId, teamId, page });

/**
 * Get all of the tournament matches of an episode,
 * optionally filtered by tournament, round and/or team.
 * @param episodeId The current episode's ID.
 * @param teamId The team's ID.
 * @param tournamentId The tournament's ID.
 * @param roundId The tournament round's ID.
 * @param page The page of matches to get.
 */
export const getTournamentMatchesList = async ({
  episodeId,
  teamId,
  tournamentId,
  roundId,
  page,
}: CompeteMatchTournamentListRequest): Promise<PaginatedMatchList> =>
  await API.competeMatchTournamentList({
    episodeId,
    page,
    roundId,
    teamId,
    tournamentId,
  });

/**
 * Get all of the matches played in the given episode. Includes both tournament
 * matches and scrimmages.
 * @param episodeId The current episode's ID.
 * @param page The page of matches to get.
 */
export const getMatchesList = async ({
  episodeId,
  page,
}: CompeteMatchListRequest): Promise<PaginatedMatchList> =>
  await API.competeMatchList({ episodeId, page });

/**
 * Get the rating history for a list of teams in a given episode.
 * Defaults to the logged in user's team if no team IDs are provided.
 *
 * @param episodeId The episode ID to retrieve rating data for.
 * @param teamIds The team IDs to retrieve rating data for.
 */
export const getRatingList = async ({
  episodeId,
  teamIds,
}: CompeteMatchHistoricalRatingListRequest): Promise<HistoricalRating[]> =>
  await API.competeMatchHistoricalRatingList({ episodeId, teamIds });
