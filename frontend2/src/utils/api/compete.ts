import {
  CompeteApi,
  type TournamentSubmission,
  type PaginatedSubmissionList,
} from "../types";
import { DEFAULT_API_CONFIGURATION } from "./constants";

/** This file contains all frontend authentication functions. Responsible for interacting with Cookies and expiring/setting JWT tokens. */
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

  const response = await fetch(url);
  const blob = await response.blob();
  // code to download the file given by the URL
  const objUrl = window.URL.createObjectURL(blob);
  const aHelper = document.createElement("a");
  aHelper.style.display = "none";
  aHelper.href = objUrl;
  aHelper.download = `battlecode_source_${submissionId}.zip`;
  document.body.appendChild(aHelper);
  aHelper.click();
  window.URL.revokeObjectURL(objUrl);
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
