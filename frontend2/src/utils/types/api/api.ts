export * from './ApiApi';
import { TokenObtainPair } from '../model/TokenObtainPair';
import { ApiApi } from './ApiApi';
import Cookies from 'js-cookie';

// Safe vs. unsafe APIs... safe API has been tested, unsafe has NOT
const API = new ApiApi();

export class ApiSafe {

  //-- Token Generation: ../../../__test__/utils.test.ts Authentication TEST 1 --//
  /**
   * Takes a set of user credentials and returns an access and refresh JSON web token pair to prove the authentication of those credentials.
   *  - TODO: Rework cookie policy - https://github.com/battlecode/galaxy/issues/647
   * @param credentials The user's credentials.
   */
  public static getApiTokens = (
    credentials: TokenObtainPair,
  ) => {
    return API.apiTokenCreate(credentials)
  }

  //-- SUBMISSIONS --//
  /**
   * Uploads a new submission to the Google Cloud storage bucket.
   * @param submission The submission to upload.
   * @param package_name The name of the package to upload.
   * @param description The description of the submission.
   * @param episode The epsiode identifier.
   * @param callback
   */
  // public static newSubmission = (

  // )



}

/** This class contains all frontend authentication functions. Responsible for interacting with Cookies and expiring/setting JWT tokens. */
export class Auth {

  /**
   * Set the access and refresh tokens in the browser's cookies.
   * @param username The username of the user.
   * @param
   */
  public static login = (
    username: string,
    password: string,
    callback?: (response: JQueryXHR, success: boolean, body?: TokenObtainPair) => void
    ) => {

    const credentials = {
      username,
      password,
      access: '',
      refresh: '',
    }

    return ApiSafe.getApiTokens(credentials)
      .done((res) => {
        Cookies.set('access', res.body.access)
        Cookies.set('refresh', res.body.refresh)

        if (callback) callback(res.response, true, res.body)
      })
      .fail((res) => {
        if (callback) callback(res.response, false)
      })
  }

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
