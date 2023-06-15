import $ from "jquery";
import { Submission, TournamentSubmission } from "./types/model/models";

//----GLOBAL CONSTANTS----//
// do not change URL here!! rather, for development, change it in ../.env.development
const URL = process.env.REACT_APP_BACKEND_URL;
const LEAGUE = 0;
const PAGE_SIZE = 10;
const SCRIMMAGE_STATUS = {
  PENDING: 0,
  QUEUED: 1,
  REJECTED: 2,
  ERROR: 3,
  BLUEWON: 4,
  REDWON: 5,
  RUNNING: 6,
  CANCELLED: 7,
};

//----SUBMISSIONS----//

/** Uploads a new submission to Google Cloud Bucket. */
export function newSubmission(
  submissionFile: Submission,
  packageName: string,
  description: string,
  episode: string,
  callback: (data: any, status: boolean, error?: any) => void
) {
  const data = new FormData();
  const submissionBlob: Blob = new Blob([JSON.stringify(submissionFile)]);
  data.append("source_code", submissionBlob);
  data.append("package", packageName);
  data.append("description", description);
  return $.ajax({
    url: `${URL}/api/compete/${episode}/submission/`,
    type: "POST",
    data: data,
    dataType: "json",
    processData: false,
    contentType: false,
  })
    .done((data, status) => {
      callback(data, true);
    })
    .fail((xhr, status, error) => {
      callback(xhr, false);
    });
}

/** Downloads a submission from Google Cloud. */
export function downloadSubmission(
  submissionId: number,
  episode: string
): void {
  $.get(`${URL}/api/compete/${episode}/submission/${submissionId}/download/`)
    .done((data, status) => {
      // have to use fetch instead of ajax here since we want to download file
      fetch(data["url"])
        .then((resp) => resp.blob())
        .then((blob) => {
          //code to download the file given by the url
          const objUrl = window.URL.createObjectURL(blob);
          const aHelper = document.createElement("a");
          aHelper.style.display = "none";
          aHelper.href = objUrl;
          aHelper.download = `battlecode_source_${submissionId}.zip`;
          document.body.appendChild(aHelper);
          aHelper.click();
          window.URL.revokeObjectURL(objUrl);
        });
    })
    .fail((xhr, status, error) => {
      console.log("Error in downloading submission: ", xhr, status, error);
    });
}

/**
 * Get a page of a user's submissions.
 * @param page The page number to get.
 * */
export function getSubmissions(
  episode: string,
  page: number,
  callback: (data: Submission[], limit: number) => void
) {
  $.get(`${URL}/api/compete/${episode}/submission/?page=${page}`).done(
    (data, status) => {
      const pageLimit = Math.ceil(data.count / PAGE_SIZE);
      callback(data, pageLimit);
    }
  );
}

/**
 * Get a page of a user's Tournament Submissions.
 * @param page The page number to get.
 */
export function getTournamentSubmissions(
  episode: string,
  page: number,
  callback: (data: TournamentSubmission[], limit: number) => void
) {
  $.get(
    `${URL}/api/compete/${episode}/submission/tournament/?page=${page}`
  ).done((data, status) => {
    data = {
      count: data.length,
      results: data,
    };
    const pageLimit = Math.ceil(data.count / PAGE_SIZE);
    callback(data, pageLimit);
  });
}

//----TEAM STATS----//
