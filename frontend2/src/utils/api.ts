import { ApiApi } from "./types/api/ApiApi";
import Cookies from "js-cookie";
import * as $ from "jquery";
import * as models from "./types/model/models";

// hacky, fall back to localhost for now
const baseUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
const LEAGUE = 0;

// Safe vs. unsafe APIs... safe API has been tested, unsafe has NOT
// TODO: how does url work? @index.tsx?
const API = new ApiApi(baseUrl);

export class ApiSafe {
  //-- TOKEN HANDLING --//

  /**
   * Takes a set of user credentials and returns an access and refresh JSON web token pair to prove the authentication of those credentials.
   *  - TODO: Rework cookie policy - https://github.com/battlecode/galaxy/issues/647
   * @param credentials The user's credentials.
   */
  public static getApiTokens = async (credentials: models.TokenObtainPair) => {
    return API.apiTokenCreate(credentials);
  };

  /**
   * Checks whether the current access token in the browser's cookies is valid.
   * Returns a promise that resolves to true if the token is valid, and false otherwise.
   */
  public static verifyCurrentToken = async (): Promise<boolean> => {
    const accessToken = Cookies.get("access");
    if (accessToken) {
      return (
        (await API.apiTokenVerifyCreate({ token: accessToken })).response
          .status === 200
      );
    } else {
      return false;
    }
  };
}

export class ApiUnsafe {
  //-- EPISODES --//
  /**
   * getMapsByEpisode (getMaps)
   */

  //-- TEAMS --//

  /**
   * Creates a new team.
   * @param teamName The name of the team.
   */
  public static createTeam = async (
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
  public static joinTeam = async (
    episodeId: string,
    teamName: string,
    joinKey: string
  ): Promise<void> => {
    const teamInfo = {
      name: teamName,
      joinKey: joinKey,
    };
    await API.apiTeamTJoinCreate(episodeId, teamInfo);
  };

  /**
   * Leave the user's current team.
   * @param episodeId The current episode's ID.
   */
  public static leaveTeam = async (episodeId: string): Promise<void> => {
    await API.apiTeamTLeaveCreate(episodeId);
  };

  /**
   * Updates the current user's team's join key.
   * @param episodeId The current episode's ID.
   * @param joinKey The new team join key.
   */
  public static updateUserTeamCode = async (
    episodeId: string,
    joinKey: string
  ): Promise<models.TeamPrivate> => {
    return (await API.apiTeamTMePartialUpdate(episodeId, { joinKey })).body;
  };

  //-- TEAM STATS --//

  // TODO: unsure of how this is supposed to work
  // /**
  //  * Get the Mu history of the given team.
  //  * @param teamId The team's ID.
  //  */
  // public static getTeamMuHistoryByTeam = async (teamId: number) => {
  //   return await $.get(`${baseUrl}/api/${LEAGUE}/team/${teamId}/history/`);
  // };

  // /**
  //  * Get the Mu history of the currently logged in user's team.
  //  */
  // public static getUserTeamMuHistory = async () => {
  // };

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

  //-- GENERAL INFO --//

  /**
   * Get the current episode's info.
   * @param episodeId The current episode's ID.
   */
  public static getEpisodeInfo = async (
    episodeId: string
  ): Promise<models.Episode> => {
    return (await API.apiEpisodeERetrieve(episodeId)).body;
  };

  /**
   * Get updates about the current league.
   * TODO: No idea how this is supposed to work!
   */
  public static getUpdates = async () => {
    $.get(`${URL}/api/league/${LEAGUE}/`, (data) => {
      for (let i = 0; i < data.updates.length; i++) {
        const d = new Date(data.updates[i].time);
        data.updates[i].dateObj = d;
        data.updates[i].date = d.toLocaleDateString();
        data.updates[i].time = d.toLocaleTimeString();
      }
    });
  };

  //-- SUBMISSIONS --//

  /**
   * Uploads a new submission to the Google Cloud Storage bucket.
   * @param episodeId The current episode's ID.
   * @param submission The submission's info.
   */
  public static uploadSubmission = async (
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
  public static downloadSubmission = async (
    episodeId: string,
    submissionId: number
  ): Promise<void> => {
    const url: string = (
      await API.apiCompeteSubmissionDownloadRetrieve(
        episodeId,
        submissionId.toString()
      )
    ).body.url;

    fetch(url)
      .then((response) => response.blob())
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
  public static getAllSubmissions = async (
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
  public static getAllUserTournamentSubmissions = async (
    episodeId: string,
    page?: number
  ): Promise<models.PaginatedSubmissionList> => {
    const res = await $.get(
      `${URL}/api/compete/${episodeId}/submission/tournament/?page=${page}`
    );
    return {
      count: parseInt(res.length ?? "0"),
      results: res ?? [],
    };
  };

  //-- USERS --//

  /**
   * Create a new user.
   * @param user The user's info.
   */
  public static createUser = async (user: models.UserCreate) => {
    return (await API.apiUserUCreate(user)).body;
  };

  /**
   * Get a user's profile.
   * @param userId The user's ID.
   */
  public static getUserProfileByUser = async (
    userId: number
  ): Promise<models.UserPublic> => {
    return (await API.apiUserURetrieve(userId)).body;
  };

  /**
   * Get all teams associated with a user.
   * @param userId The user's ID.
   */
  public static getTeamsByUser = async (
    userId: number
  ): Promise<models.TeamPublic> => {
    return (await API.apiUserUTeamsRetrieve(userId)).body;
  };

  /**
   * Get the currently logged in user's profile.
   */
  public static getUserProfile = async (): Promise<models.UserPrivate> => {
    return (await API.apiUserUMeRetrieve()).body;
  };

  /**
   * Update the currently logged in user's info.
   */
  public static updateUser = async (
    user: models.PatchedUserPrivate
  ): Promise<void> => {
    await API.apiUserUMePartialUpdate(user);
  };

  //-- AVATARS/RESUMES/REPORTS --//

  /**
   * avatarUpload
   */

  /**
   * teamAvatarUpload
   */

  /**
   * resumeUpload
   */

  /**
   * resumeRetrieve
   */

  /**
   * teamReportUpload
   */

  //-- SCRIMMAGES/MATCHES --//

  /**
   * Accept a scrimmage invitation.
   * @param episodeId The current episode's ID.
   * @param scrimmageId The scrimmage's ID to accept.
   */
  public static acceptScrimmage = async (
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
  public static rejectScrimmage = async (
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
  public static getUserScrimmagesInbox = async (
    episodeId: string,
    page?: number
  ): Promise<models.PaginatedScrimmageRequestList> => {
    return (await API.apiCompeteRequestInboxList(episodeId, page)).body;
  };

  /**
   * Get all of the currently logged in user's outgoing scrimmage requests.
   * @param episodeId The current episode's ID.
   */
  public static getUserScrimmagesOutbox = async (
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
  public static requestScrimmage = async (
    episodeId: string,
    request: {
      isRanked: boolean;
      requestedTo: number;
      playerOrder: models.PlayerOrderEnum;
      mapNames: Array<string>;
    }
  ) => {
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
  public static getUserScrimmages = async (
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
  public static getScrimmagesByTeam = async (
    episodeId: string,
    teamId: number,
    page?: number
  ): Promise<models.PaginatedMatchList> => {
    return (await API.apiCompeteMatchScrimmageList(episodeId, teamId, page))
      .body;
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
  public static getMatchesByTeam = async (
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
  public static getAllMatches = async (
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
  public static getAllScrimmages = async (
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
  public static getUserMatches = async (
    episodeId: string,
    page?: number
  ): Promise<models.PaginatedMatchList> => {
    return (await API.apiCompeteMatchList(episodeId, page)).body;
  };

  //-- TOURNAMENTS --//
  /**
   * Get the next tournament occurring during the given episode, as ordered by submission freeze time.
   * @param episodeId The current episode's ID.
   */
  public static getNextTournament = async (
    episodeId: string
  ): Promise<models.Tournament> => {
    return (await API.apiEpisodeTournamentNextRetrieve(episodeId)).body;
  };

  /**
   * Get all of the tournaments occurring during the given episode.
   * @param episodeId The current episode's ID.
   * @param page The page of tournaments to get.
   */
  public static getAllTournaments = async (
    episodeId: string,
    page?: number
  ): Promise<models.PaginatedTournamentList> => {
    return (await API.apiEpisodeTournamentList(episodeId, page)).body;
  };
}

/** This class contains all frontend authentication functions. Responsible for interacting with Cookies and expiring/setting JWT tokens. */
export class Auth {
  /**
   * Clear the access and refresh tokens from the browser's cookies.
   * UNSAFE!!! Needs to be tested.
   */
  public static logout = () => {
    Cookies.set("access", "");
    Cookies.set("refresh", "");
    Auth.setLoginHeader();
    window.location.replace("/");
  };

  /**
   * Set the access and refresh tokens in the browser's cookies.
   * @param username The username of the user.
   * @param password The password of the user.
   */
  public static login = async (
    username: string,
    password: string,
    callback?: (
      response: JQueryXHR,
      success: boolean,
      body?: models.TokenObtainPair
    ) => void
  ) => {
    const credentials = {
      username,
      password,
      access: "",
      refresh: "",
    };

    return await ApiSafe.getApiTokens(credentials)
      .then((res) => {
        Cookies.set("access", res.body.access);
        Cookies.set("refresh", res.body.refresh);

        if (callback) callback(res.response, true, res.body);
      })
      .catch((res) => {
        if (callback) callback(res.response, false);
      });
  };

  /**
   * Set authorization header based on the current cookie state, which is provided by
   * default for all subsequent requests. The header is a JWT token: see
   * https://django-rest-framework-simplejwt.readthedocs.io/en/latest/getting_started.html
   */
  public static setLoginHeader = () => {
    const accessToken = Cookies.get("access");
    if (accessToken) {
      $.ajaxSetup({
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    }
  };

  /**
   * Checks whether the currently held JWT access token is still valid (by posting it to the verify endpoint),
   * hence whether or not the frontend still has logged-in access.
   * @returns true or false
   * Callers of this method should check this, before rendering their logged-in or un-logged-in versions.
   * If not logged in, then api calls will give 403s, and the website will tell you to log in anyways.
   */
  public static loginCheck = async (): Promise<boolean> => {
    return await ApiSafe.verifyCurrentToken();
  };

  /**
   * Register a new user.
   * @param user The user to register.
   */
  public static register = async (user: models.UserCreate): Promise<void> => {
    const newUser = await ApiUnsafe.createUser(user);
    return await Auth.login(user.username, user.password);
  };

  /**
   * Confirm resetting a user's password.
   * @param password The new password.
   * @param token The password reset token.
   */
  public static doResetPassword = async (
    password: string,
    token: string
  ): Promise<void> => {
    await API.apiUserPasswordResetConfirmCreate({ password, token });
  };

  /**
   * Request a password reset token to be sent to the provided email.
   */
  public static forgotPassword = async (email: string): Promise<void> => {
    await API.apiUserPasswordResetCreate({ email: email });
  };
}
