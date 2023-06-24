import { ApiApi } from "./types/api/ApiApi";
import Cookies from "js-cookie";
import * as $ from "jquery";
import * as models from "./types/model/models";

// Safe vs. unsafe APIs... safe API has been tested, unsafe has NOT
// TODO: how does url work? @index.tsx?
const API = new ApiApi(
  process.env.REACT_APP_BACKEND_URL || "http://localhost:8000"
);

export class ApiSafe {
  //-- Token Generation: ../../../__test__/utils.test.ts Authentication TEST 1 --//
  /**
   * Takes a set of user credentials and returns an access and refresh JSON web token pair to prove the authentication of those credentials.
   *  - TODO: Rework cookie policy - https://github.com/battlecode/galaxy/issues/647
   * @param credentials The user's credentials.
   */
  public static getApiTokens = async (credentials: models.TokenObtainPair) => {
    return API.apiTokenCreate(credentials);
  };
}

export class ApiUnsafe {
  //-- EPISODE FUNCTIONS --//
  /**
   * getMapsByEpisode (getMaps)
   */

  //-- TEAM FUNCTIONS --//

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

  //-- USER FUNCTIONS --//

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

  //-- SCRIMMAGE/MATCH FUNCTIONS --//

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
  public static getMatchesByEpisode = async (
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
  public static getScrimmagesByEpisode = async (
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
}

/** This class contains all frontend authentication functions. Responsible for interacting with Cookies and expiring/setting JWT tokens. */
export class Auth {
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
    const access_token = Cookies.get("access");
    if (access_token) {
      $.ajaxSetup({
        headers: { Authorization: `Bearer ${access_token}` },
      });
    }
  };

  /**
   * logout
   */

  /**
   * setLoginHeader
   */

  /**
   * loginCheck
   */

  /**
   * register
   */

  /**
   * doResetPassword
   */

  /**
   * forgotPassword
   */

  /**
   * pushTeamCode
   */
}
