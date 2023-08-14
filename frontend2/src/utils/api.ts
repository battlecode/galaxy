import { ApiApi } from "./types/api/ApiApi";
import Cookies from "js-cookie";
import * as $ from "jquery";
import * as models from "./types/model/models";
import type * as customModels from "./apiTypes";

// hacky, fall back to localhost for now
const baseUrl = process.env.REACT_APP_BACKEND_URL ?? "http://localhost:8000";
// const LEAGUE = 0; // To be used later for rating history

// TODO: how does url work? @index.tsx?
// This is an instance of the auto-generated API class.
// The "ApiApi" class should not be imported/used anywhere but this file and auth.ts!
const API = new ApiApi(baseUrl);

// -- TOKEN HANDLING --//

/**
 * Takes a set of user credentials and returns an access and refresh JSON web token pair to prove the authentication of those credentials.
 *  - TODO: Rework cookie policy - https://github.com/battlecode/galaxy/issues/647
 * @param credentials The user's credentials.
 */
export const getApiTokens = async (
  credentials: models.TokenObtainPair
): Promise<models.TokenObtainPair> => {
  return (await API.apiTokenCreate(credentials)).body;
};

/**
 * Checks whether the current access token in the browser's cookies is valid.
 * Returns a promise that resolves to true if the token is valid, and false otherwise.
 */
export const verifyCurrentToken = async (): Promise<boolean> => {
  const accessToken = Cookies.get("access");
  if (accessToken !== undefined) {
    return (
      (await API.apiTokenVerifyCreate({ token: accessToken })).response
        .status === 200
    );
  } else {
    return false;
  }
};

// -- EPISODES --//
/**
 * Get all maps for the provided episode.
 * @param episodeId The current episode's ID.
 */
export const getAllMaps = async (
  episodeId: string
): Promise<models.ModelMap[]> => {
  return (
    ((await $.get(
      `${baseUrl}/api/episode/${episodeId}/map/`
    )) as models.ModelMap[]) ?? []
  );
};

// -- TEAMS --//

/**
 * Creates a new team.
 * @param teamName The name of the team.
 */
export const createTeam = async (
  episodeId: string,
  teamName: string
): Promise<models.TeamCreate> => {
  // build default object... why? I couldn't tell you
  const teamCreate = {
    id: -1,
    episodeId,
    name: teamName,
    members: [],
    joinKey: "",
    status: models.Status526Enum.R,
  };

  return (await API.apiTeamTCreate(episodeId, teamCreate)).body;
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
  joinKey: string
): Promise<void> => {
  const teamInfo = {
    name: teamName,
    joinKey,
  };
  await API.apiTeamTJoinCreate(episodeId, teamInfo);
};

/**
 * Leave the user's current team.
 * @param episodeId The current episode's ID.
 */
export const leaveTeam = async (episodeId: string): Promise<void> => {
  await API.apiTeamTLeaveCreate(episodeId);
};

/**
 * Updates the current user's team's join key.
 * @param episodeId The current episode's ID.
 * @param joinKey The new team join key.
 */
export const updateUserTeamCode = async (
  episodeId: string,
  joinKey: string
): Promise<models.TeamPrivate> => {
  return (await API.apiTeamTMePartialUpdate(episodeId, { joinKey })).body;
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

// -- SEARCHING --//

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
  page?: number
): Promise<models.PaginatedTeamPublicList> => {
  const apiURL = `${baseUrl}/api/team/${episodeId}/t`;
  const encQuery = encodeURIComponent(searchQuery);
  const teamUrl =
    `${apiURL}/?ordering=-rating,name&search=${encQuery}&page=${page ?? 1}` +
    (requireActiveSubmission ? `&has_active_submission=true` : ``);
  return (await $.get(teamUrl)) as models.PaginatedTeamPublicList;
};

// -- GENERAL INFO --//

/**
 * Get the current episode's info.
 * @param episodeId The current episode's ID.
 */
export const getEpisodeInfo = async (
  episodeId: string
): Promise<models.Episode> => {
  return (await API.apiEpisodeERetrieve(episodeId)).body;
};

/**
 * Get updates about the current league.
 * TODO: No idea how this is supposed to work!
 */
// export const getUpdates = async (): Promise<any> => {
//   return await $.get(`${baseUrl}/api/league/${LEAGUE}/`, (data) => {
//     for (let i = 0; i < data.updates.length; i++) {
//       const d = new Date(data.updates[i].time);
//       data.updates[i].dateObj = d;
//       data.updates[i].date = d.toLocaleDateString();
//       data.updates[i].time = d.toLocaleTimeString();
//     }
//   });
// };

// -- SUBMISSIONS --//

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
  }
): Promise<void> => {
  const fileData = new FormData();
  fileData.append("source_code", submission.file);
  fileData.append("package", submission.packageName);
  fileData.append("description", submission.description);
  await $.ajax({
    url: `${baseUrl}/api/episode/${episodeId}/submission/`,
    type: "POST",
    data: fileData,
    dataType: "json",
    processData: false,
    contentType: false,
  });
};

/**
 * Download a submission from the Google Cloud Storage bucket.
 * @param episodeId The current episode's ID.
 * @param submissionId The submission's ID.
 */
export const downloadSubmission = async (
  episodeId: string,
  submissionId: number
): Promise<void> => {
  const url: string = (
    await API.apiCompeteSubmissionDownloadRetrieve(
      episodeId,
      submissionId.toString()
    )
  ).body.url;

  await fetch(url)
    .then(async (response) => await response.blob())
    .then((blob) => {
      // code to download the file given by the URL
      const objUrl = window.URL.createObjectURL(blob);
      const aHelper = document.createElement("a");
      aHelper.style.display = "none";
      aHelper.href = objUrl;
      aHelper.download = `battlecode_source_${submissionId}.zip`;
      document.body.appendChild(aHelper);
      aHelper.click();
      window.URL.revokeObjectURL(objUrl);
    });
};

/**
 * Get all submissions.
 * @param episodeId The current episode's ID.
 * @param page The page number.
 */
export const getAllSubmissions = async (
  episodeId: string,
  page?: number
): Promise<models.PaginatedSubmissionList> => {
  return (await API.apiCompeteSubmissionList(episodeId, page)).body;
};

/**
 * Get all tournament Submissions for the currently logged in user's team.
 * @param episodeId The current episode's ID.
 * @param page The page number.
 */
export const getAllUserTournamentSubmissions = async (
  episodeId: string,
  page?: number
): Promise<models.PaginatedSubmissionList> => {
  const res: models.Submission[] = (await $.get(
    `${baseUrl}/api/compete/${episodeId}/submission/tournament/?page=${
      page ?? 1
    }`
  )) as unknown as models.Submission[];
  return {
    count: res.length,
    results: res ?? [],
  };
};

// -- USERS --//

/**
 * Create a new user.
 * @param user The user's info.
 */
export const createUser = async (
  user: customModels.CreateUserInput
): Promise<models.UserCreate> => {
  const defaultUser = {
    id: -1,
    isStaff: false,
    profile: {
      avatarUrl: "",
      hasAvatar: false,
      hasResume: false,
    },
  };
  // convert our input into models.UserCreate.
  return (
    await API.apiUserUCreate({
      ...defaultUser,
      ...user,
      profile: {
        ...defaultUser.profile,
        ...user.profile,
        gender: user.profile.gender as unknown as models.GenderEnum,
        country: user.profile.country as unknown as models.CountryEnum,
      },
    })
  ).body;
};

/**
 * Get a user's profile.
 * @param userId The user's ID.
 */
export const getUserProfileByUser = async (
  userId: number
): Promise<models.UserPublic> => {
  return (await API.apiUserURetrieve(userId)).body;
};

/**
 * Get the currently logged in user's profile.
 */
export const getUserUserProfile = async (): Promise<models.UserPrivate> => {
  return (await API.apiUserUMeRetrieve()).body;
};

/**
 * Get all teams associated with a user.
 * @param userId The user's ID.
 */
export const getTeamsByUser = async (
  userId: number
): Promise<models.TeamPublic> => {
  return (await API.apiUserUTeamsRetrieve(userId)).body;
};

/**
 * Update the currently logged in user's info.
 */
export const updateUser = async (
  user: models.PatchedUserPrivate
): Promise<void> => {
  await API.apiUserUMePartialUpdate(user);
};

// -- AVATARS/RESUMES/REPORTS --//

/**
 * Upload a new avatar for the currently logged in user.
 * @param avatarFile The avatar file.
 */
export const avatarUpload = async (avatarFile: File): Promise<void> => {
  const data = new FormData();
  data.append("avatar", avatarFile);
  await $.ajax({
    url: `${baseUrl}/api/user/u/avatar/`,
    type: "POST",
    data,
    dataType: "json",
    processData: false,
    contentType: false,
  });
};

/**
 * Upload a new avatar for the currently logged in user's team.
 * @param episodeId The current episode's ID.
 * @param avatarFile The avatar file.
 */
export const teamAvatarUpload = async (
  episodeId: string,
  avatarFile: File
): Promise<void> => {
  const data = new FormData();
  data.append("avatar", avatarFile);
  await $.ajax({
    url: `${baseUrl}/api/team/${episodeId}/t/avatar/`,
    type: "POST",
    data,
    dataType: "json",
    processData: false,
    contentType: false,
  });
};

/**
 * Upload a resume for the currently logged in user.
 * @param resumeFile The resume file.
 */
export const resumeUpload = async (resumeFile: File): Promise<void> => {
  const data = new FormData();
  data.append("resume", resumeFile);
  await $.ajax({
    url: `${baseUrl}/api/user/u/resume/`,
    type: "PUT",
    data,
    dataType: "json",
    processData: false,
    contentType: false,
  });
};

/**
 * Download the resume of the currently logged in user.
 */
export const downloadResume = async (): Promise<void> => {
  await $.ajax({
    url: `${baseUrl}/api/user/u/resume/`,
    type: "GET",
  }).done((data) => {
    const blob = new Blob([data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    // See https://stackoverflow.com/a/9970672 for file download logic
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = "resume.pdf";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  });
};

/**
 * Upload a new report for the currently logged in user's team.
 * @param episodeId The current episode's ID.
 * @param reportFile The report file.
 */
export const uploadUserTeamReport = async (
  episodeId: string,
  reportFile: File
): Promise<void> => {
  const data = new FormData();
  data.append("report", reportFile);
  await $.ajax({
    url: `${baseUrl}/api/team/${episodeId}/requirement/report/`,
    type: "PUT",
    data,
    dataType: "json",
    processData: false,
    contentType: false,
  });
};

// -- SCRIMMAGES/MATCHES --//

/**
 * Accept a scrimmage invitation.
 * @param episodeId The current episode's ID.
 * @param scrimmageId The scrimmage's ID to accept.
 */
export const acceptScrimmage = async (
  episodeId: string,
  scrimmageId: number
): Promise<void> => {
  const scrimId = scrimmageId.toString();
  await API.apiCompeteRequestAcceptCreate(episodeId, scrimId);
};

/**
 * Reject a scrimmage invitation.
 * @param episodeId The current episode's ID.
 * @param scrimmageId The scrimmage's ID to reject.
 */
export const rejectScrimmage = async (
  episodeId: string,
  scrimmageId: number
): Promise<void> => {
  const scrimId = scrimmageId.toString();
  await API.apiCompeteRequestRejectCreate(episodeId, scrimId);
};

/**
 * Get all of the currently logged in user's incoming scrimmage requests.
 * @param episodeId The current episode's ID.
 */
export const getUserScrimmagesInbox = async (
  episodeId: string,
  page?: number
): Promise<models.PaginatedScrimmageRequestList> => {
  return (await API.apiCompeteRequestInboxList(episodeId, page)).body;
};

/**
 * Get all of the currently logged in user's outgoing scrimmage requests.
 * @param episodeId The current episode's ID.
 */
export const getUserScrimmagesOutbox = async (
  episodeId: string,
  page?: number
): Promise<models.PaginatedScrimmageRequestList> => {
  return (await API.apiCompeteRequestOutboxList(episodeId, page)).body;
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
    playerOrder: models.PlayerOrderEnum;
    mapNames: string[];
  }
): Promise<void> => {
  // Once again, the important values are params, we can just throw in the rest here to make the type happy
  const scrimRequest: models.ScrimmageRequest = {
    ...request,
    id: -1,
    episode: "",
    created: "",
    status: models.ScrimmageRequestStatusEnum.P,
    requestedBy: -1,
    requestedByName: "",
    requestedByRating: -1,
    requestedToName: "",
    requestedToRating: -1,
    maps: [],
  };
  await API.apiCompeteRequestCreate(episodeId, scrimRequest);
};

/**
 * Get all of the scrimmages that the currently logged in user's team has played.
 * @param episodeId The current episode's ID.
 * @param page The page of scrimmages to get.
 */
export const getUserScrimmages = async (
  episodeId: string,
  page?: number
): Promise<models.PaginatedMatchList> => {
  return (await API.apiCompeteMatchScrimmageList(episodeId, page)).body;
};

/**
 * Get all of the scrimmages that a given team has played.
 * @param episodeId The current episode's ID.
 * @param teamId The team's ID.
 * @param page The page of scrimmages to get.
 */
export const getScrimmagesByTeam = async (
  episodeId: string,
  teamId: number,
  page?: number
): Promise<models.PaginatedMatchList> => {
  return (await API.apiCompeteMatchScrimmageList(episodeId, teamId, page)).body;
};

/**
 * Get all of the tournament matches that the given team has played.
 * Can be optionally filtered by tournament and round.
 * @param episodeId The current episode's ID.
 * @param teamId The team's ID.
 * @param tournamentId The tournament's ID.
 * @param roundId The tournament round's ID.
 * @param page The page of matches to get.
 */
export const getMatchesByTeam = async (
  episodeId: string,
  teamId: number,
  tournamentId?: string,
  roundId?: number,
  page?: number
): Promise<models.PaginatedMatchList> => {
  return (
    await API.apiCompeteMatchTournamentList(
      episodeId,
      page,
      roundId,
      teamId,
      tournamentId
    )
  ).body;
};

/**
 * Get all of the tournament matches played in the given episode.
 * @param episodeId The current episode's ID.
 * @param page The page of matches to get.
 */
export const getAllMatches = async (
  episodeId: string,
  page?: number
): Promise<models.PaginatedMatchList> => {
  return (await API.apiCompeteMatchList(episodeId, page)).body;
};

/**
 * Get all of the scrimmages played in the given episode.
 * @param episodeId The current episode's ID.
 * @param page The page of scrimmages to get.
 */
export const getAllScrimmages = async (
  episodeId: string,
  page?: number
): Promise<models.PaginatedMatchList> => {
  return (await API.apiCompeteMatchScrimmageList(episodeId, page)).body;
};

/**
 * Get all of the tournament matches the currently logged in user's team has played.
 * @param episodeId The current episode's ID.
 * @param tournamentId The tournament's ID.
 */
export const getUserMatches = async (
  episodeId: string,
  page?: number
): Promise<models.PaginatedMatchList> => {
  return (await API.apiCompeteMatchList(episodeId, page)).body;
};

// -- TOURNAMENTS --//
/**
 * Get the next tournament occurring during the given episode, as ordered by submission freeze time.
 * @param episodeId The current episode's ID.
 */
export const getNextTournament = async (
  episodeId: string
): Promise<models.Tournament> => {
  return (await API.apiEpisodeTournamentNextRetrieve(episodeId)).body;
};

/**
 * Get all of the tournaments occurring during the given episode.
 * @param episodeId The current episode's ID.
 * @param page The page of tournaments to get.
 */
export const getAllTournaments = async (
  episodeId: string,
  page?: number
): Promise<models.PaginatedTournamentList> => {
  return (await API.apiEpisodeTournamentList(episodeId, page)).body;
};
