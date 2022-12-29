import $ from "jquery";
import Cookies from "js-cookie";

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

class Api {
  static testSetOutcome() {}

  //----SUBMISSIONS----

  //uploads a new submission to the google cloud bucket
  static newSubmission(
    submission_file,
    package_name,
    description,
    episode,
    callback
  ) {
    const data = new FormData();
    data.append("source_code", submission_file);
    data.append("package", package_name);
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
        callback(true);
      })
      .fail((xhr, status, error) => {
        callback(false);
      });
  }

  static downloadSubmission(submissionId, fileNameAddendum, callback) {
    $.get(`${URL}/api/${LEAGUE}/submission/${submissionId}/retrieve_file/`)
      .done((data, status) => {
        // have to use fetch instead of ajax here since we want to download file
        fetch(data["download_url"])
          .then((resp) => resp.blob())
          .then((blob) => {
            //code to download the file given by the url
            const objUrl = window.URL.createObjectURL(blob);
            const aHelper = document.createElement("a");
            aHelper.style.display = "none";
            aHelper.href = objUrl;
            aHelper.download = `${fileNameAddendum}_battlecode_source.zip`;
            document.body.appendChild(aHelper);
            aHelper.click();
            window.URL.revokeObjectURL(objUrl);
          });
      })
      .fail((xhr, status, error) => {
        console.log("Error in downloading submission: ", xhr, status, error);
      });
  }

  static getTeamSubmissions(callback) {
    $.get(
      `${URL}/api/${LEAGUE}/teamsubmission/${Cookies.get("team_id")}/`
    ).done((data, status) => {
      callback(data);
    });
  }

  static getSubmission(id, callback, callback_data) {
    $.get(`${URL}/api/${LEAGUE}/submission/${id}/`).done((data, status) => {
      callback(callback_data, data);
    });
  }

  static getCompilationStatus(callback) {
    $.get(
      `${URL}/api/${LEAGUE}/teamsubmission/${Cookies.get(
        "team_id"
      )}/team_compilation_status/`
    ).done((data, status) => {
      callback(data);
    });
  }

  // note that this is a submission, not a teamsubmission, thing
  static getSubmissionStatus(callback) {
    $.get(
      `${URL}/api/${LEAGUE}/submission/${Cookies.get(
        "submission_id"
      )}/get_status/`
    ).done((data, status) => {
      return data["compilation_status"];
      // callback(data)
    });
  }

  static getSubmissionLog(id, callback) {
    $.get(`${URL}/api/${LEAGUE}/submission/${id}/log/`).done((data, status) => {
      callback(data);
    });
  }

  //----TEAM STATS---

  // clean these calls, fix in #368

  // data from scrimmaging
  static getOwnTeamMuHistory(callback) {
    return Api.getTeamMuHistory(Cookies.get("team_id"), callback);
  }

  static getTeamMuHistory(team, callback) {
    $.get(`${URL}/api/${LEAGUE}/team/${team}/history/`).done((data, status) => {
      callback(data);
    });
  }

  static getTeamWinStats(callback) {
    return Api.getOtherTeamWinStats(Cookies.get("team_id"), callback);
  }

  static getOtherTeamWinStats(team, callback) {
    this.getTeamMuHistory(team, (data) => {
      let wins = 0;
      let losses = 0;
      data.forEach((entry) => {
        if (entry.won === true) {
          wins++;
        } else if (entry.won === false) {
          losses++;
        } // entry.won can be null when errors occur, doesn't contribute to win/loss
      });

      callback([wins, losses]);
    });
  }

  //get data for team with team_id
  static getTeamById(team_id, callback) {
    $.get(`${URL}/api/${LEAGUE}/team/${team_id}/`).done((data, status) => {
      callback(data);
    });
  }

  //calculates rank of given team, with tied teams receiving the same rank
  //i.e. if mu is 10,10,1 the ranks would be 1,1,3
  static getTeamRanking(team_id, callback) {
    const requestUrl = `${URL}/api/${LEAGUE}/team/${team_id}/ranking/`;
    $.get(requestUrl).done((data, status) => {
      callback(data);
    });
  }

  //----GENERAL INFO----

  static getEpisodeInfo(episode, callback) {
    return $.get(`${URL}/api/episode/e/${episode}/`)
      .done((data, success) => {
        callback(data);
      })
      .fail((xhr, status, error) => {
        console.log("Error in getting episode info: ", xhr, status, error);
      });
  }

  static getUpdates(callback) {
    $.get(`${URL}/api/league/${LEAGUE}/`, (data, success) => {
      for (let i = 0; i < data.updates.length; i++) {
        const d = new Date(data.updates[i].time);
        data.updates[i].dateObj = d;
        data.updates[i].date = d.toLocaleDateString();
        data.updates[i].time = d.toLocaleTimeString();
      }

      callback(data.updates);
    });
  }

  //----SEARCHING----

  // Search teams, ordering result by ranking.
  static searchTeam(query, page, episode, callback) {
    const apiURL = `${URL}/api/team/${episode}/t`;
    const encQuery = encodeURIComponent(query);
    const teamUrl = `${apiURL}/?ordering=-rating,name&search=${encQuery}&page=${page}`;
    $.get(teamUrl, (teamData) => {
      const pageLimit = Math.ceil(teamData.count / PAGE_SIZE);
      callback(teamData.results, pageLimit);
    });
  }

  static searchUser(query, page, callback) {
    const encQuery = encodeURIComponent(query);
    const userUrl = `${URL}/api/user/profile/?search=${encQuery}&page=${page}`;
    $.get(userUrl, (userData) => {
      callback({
        userPage: page,
        users: userData.results,
      });
    });
  }

  //---TEAM INFO---

  static getTeamProfile(episode, teamId, callback) {
    return $.get(`${URL}/api/team/${episode}/t/${teamId}/`)
      .done((data, status) => {
        callback(data);
      })
      .fail((xhr, status, error) => {
        console.log("Error in getting user's team profile", xhr, status, error);
        callback(null);
      });
  }

  static getUserTeamProfile(episode, callback) {
    return $.get(`${URL}/api/team/${episode}/t/me/`)
      .done((data, status) => {
        callback(data);
      })
      .fail((xhr, status, error) => {
        console.log("Error in getting user's team profile", xhr, status, error);
        callback(null);
      });
  }

  // updates team
  static updateTeam(team, episode, callback) {
    return $.ajax({
      url: `${URL}/api/team/${episode}/t/me/`,
      data: JSON.stringify(team),
      type: "PUT",
      contentType: "application/json",
      dataType: "json",
    })
      .done((data, status) => {
        callback(data, true);
      })
      .fail((xhr, status, error) => {
        callback(xhr.responseJSON, false);
      });
  }

  //----USER FUNCTIONS----

  static createTeam(team_name, episode, callback) {
    const team_data = {
      name: team_name,
    };
    return $.ajax({
      url: `${URL}/api/team/${episode}/t/`,
      data: JSON.stringify(team_data),
      type: "POST",
      contentType: "application/json",
      dataType: "json",
    })
      .done((data, status) => {
        callback(true);
      })
      .fail((xhr, status, error) => {
        callback(false);
      });
  }

  static joinTeam(join_key, team_name, episode, callback) {
    const join_data = {
      join_key: join_key,
      name: team_name,
    };
    return $.ajax({
      url: `${URL}/api/team/${episode}/t/join/`,
      data: JSON.stringify(join_data),
      type: "POST",
      contentType: "application/json",
      dataType: "json",
    })
      .done((data, status) => {
        callback(true);
      })
      .fail((xhr, status, error) => {
        callback(false);
      });
  }

  static leaveTeam(episode, callback) {
    return $.ajax({
      url: `${URL}/api/team/${episode}/t/leave/`,
      type: "POST",
    })
      .done((data, status) => {
        callback(true);
      })
      .fail((xhr, status, error) => {
        callback(false);
      });
  }

  static getProfileByUser(user_id, callback) {
    return $.get(`${URL}/api/user/u/${user_id}/`)
      .done((data, status) => {
        callback(data);
      })
      .fail((xhr, status, error) => {
        console.log("Error in getting profile for user", xhr, status, error);
      });
  }

  static getUserTeams(user_id, callback) {
    return $.get(`${URL}/api/user/u/${user_id}/teams/`)
      .done((data, status) => {
        callback(data);
      })
      .fail((xhr, status, error) => {
        console.log("Error in getting user's teams", xhr, status, error);
      });
  }

  static getUserProfile(callback) {
    return this.getProfileByUser("me", callback);
  }

  static updateUser(user, callback) {
    return $.ajax({
      url: `${URL}/api/user/u/me/`,
      data: JSON.stringify(user),
      type: "PUT",
      contentType: "application/json",
      dataType: "json",
    })
      .done((data, status) => {
        callback(data, true);
      })
      .fail((xhr, status, error) => {
        callback(xhr.responseJSON, false);
      });
  }

  static avatarUpload(avatar_file, callback) {
    const data = new FormData();
    data.append("avatar", avatar_file);
    return $.ajax({
      url: `${URL}/api/user/u/avatar/`,
      type: "POST",
      data: data,
      dataType: "json",
      processData: false,
      contentType: false,
    })
      .done((data, status) => {
        callback(true);
      })
      .fail((xhr, status, error) => {
        callback(false);
      });
  }

  static teamAvatarUpload(avatar_file, episode, callback) {
    const data = new FormData();
    data.append("avatar", avatar_file);
    return $.ajax({
      url: `${URL}/api/team/${episode}/t/avatar/`,
      type: "POST",
      data: data,
      dataType: "json",
      processData: false,
      contentType: false,
    })
      .done((data, status) => {
        callback(true);
      })
      .fail((xhr, status, error) => {
        callback(false);
      });
  }

  static resumeUpload(resume_file, callback) {
    const data = new FormData();
    data.append("resume", resume_file);
    return $.ajax({
      url: `${URL}/api/user/u/resume/`,
      type: "PUT",
      data: data,
      dataType: "json",
      processData: false,
      contentType: false,
    })
      .done((data, status) => {
        callback(true);
      })
      .fail((xhr, status, error) => {
        callback(false);
      });
  }

  static resumeRetrieve(callback) {
    return $.ajax({
      url: `${URL}/api/user/u/resume/`,
      type: "GET",
    })
      .done((data, status) => {
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
        callback(true);
      })
      .fail((xhr, status, error) => {
        callback(false);
      });
  }

  //----SCRIMMAGING----

  static acceptScrimmage(scrimmage_id, callback) {
    $.ajax({
      url: `${URL}/api/${LEAGUE}/scrimmage/${scrimmage_id}/accept/`,
      method: "PATCH",
    })
      .done((data, status) => {
        callback(true);
      })
      .fail((xhr, status, error) => {
        callback(false);
      });
  }

  static rejectScrimmage(scrimmage_id, callback) {
    $.ajax({
      url: `${URL}/api/${LEAGUE}/scrimmage/${scrimmage_id}/reject/`,
      method: "PATCH",
    })
      .done((data, status) => {
        callback(true);
      })
      .fail((xhr, status, error) => {
        callback(false);
      });
  }

  static getScrimmageRequests(episode, callback) {
    return $.get(`${URL}/api/compete/${episode}/request/inbox/`)
      .done((data, status) => {
        callback(data.results);
      })
      .fail((xhr, status, error) => {
        console.log(
          "Error in getting user's scrimmage requests",
          xhr,
          status,
          error
        );
        callback(null);
      });
  }

  static getMaps(episode, callback) {
    return $.get(`${URL}/api/episode/${episode}/map/`)
      .done((data, status) => {
        callback(data);
      })
      .fail((xhr, status, error) => {
        console.log("Error in getting episode maps", xhr, status, error);
        callback(null);
      });
  }

  static requestScrimmage(
    is_ranked,
    requested_to,
    player_order,
    map_names,
    episode,
    callback
  ) {
    const data = {
      is_ranked,
      requested_to,
      player_order,
      map_names,
    };
    return $.ajax({
      url: `${URL}/api/compete/${episode}/request/`,
      data: JSON.stringify(data),
      type: "POST",
      contentType: "application/json",
      dataType: "json",
    })
      .done((data, status) => {
        callback(true);
      })
      .fail((xhr, status, error) => {
        callback(false);
      });
  }

  static getAllTeamScrimmages(callback) {
    $.get(`${URL}/api/${LEAGUE}/scrimmage/`, (data, success) => {
      callback(data);
    });
  }

  /* for some reason the data format from getAllTeamScrimmages and getTeamScrimmages
   are different; has to do with pagination but not sure how to make the same
  */
  static getTeamScrimmages(callback, page) {
    $.get(
      `${URL}/api/${LEAGUE}/scrimmage/?page=${page}&pending=0`,
      (data, success) => {
        callback(data.results, data.count);
      }
    );
  }

  static getScrimmageHistory(callback, page) {
    this.getTeamScrimmages((s, count) => {
      const requests = [];
      for (let i = 0; i < s.length; i++) {
        const on_red = s[i].red_team === Cookies.get("team_name");

        switch (s[i].status) {
          case SCRIMMAGE_STATUS.BLUEWON:
            s[i].status = on_red ? "Lost" : "Won";
            s[i].score =
              s[i].status === "Won"
                ? `${s[i].winscore} - ${s[i].losescore}`
                : `${s[i].losescore} - ${s[i].winscore}`;
            break;
          case SCRIMMAGE_STATUS.REDWON:
            s[i].status = on_red ? "Won" : "Lost";
            s[i].score =
              s[i].status === "Won"
                ? `${s[i].winscore} - ${s[i].losescore}`
                : `${s[i].losescore} - ${s[i].winscore}`;
            break;
          case SCRIMMAGE_STATUS.QUEUED:
            s[i].status = "Queued";
            break;
          case SCRIMMAGE_STATUS.REJECTED:
            s[i].status = "Rejected";
            break;
          case SCRIMMAGE_STATUS.ERROR:
            s[i].status = "Error";
            break;
          case SCRIMMAGE_STATUS.RUNNING:
            s[i].status = "Running";
            break;
          case SCRIMMAGE_STATUS.CANCELLED:
            s[i].status = "Cancelled";
            break;
          default:
            // should not reach here, undefined status or pending
            s[i].status = "";
            break;
        }

        if (s[i].status !== "Won" && s[i].status !== "Lost") {
          s[i].replay = undefined;
          s[i].score = " - ";
        }

        s[i].date = new Date(s[i].updated_at).toLocaleDateString();
        s[i].time = new Date(s[i].updated_at).toLocaleTimeString();

        s[i].team = on_red ? s[i].blue_team : s[i].red_team;
        s[i].color = on_red ? "Red" : "Blue";

        requests.push(s[i]);
      }
      // scrimLimit for pagination
      const scrimLimit =
        parseInt(count / PAGE_LIMIT, 10) + !!(count % PAGE_LIMIT);
      callback({ scrimmages: requests, scrimLimit });
    }, page);
  }

  //----REPLAYS?-----

  static getReplayFromURL(url, callback) {
    // If `https` not in current url, replace `https` with `http` in above
    if (window.location.href.indexOf("http://") > -1) {
      url = url.replace("https://", "http://");
    }

    const oReq = new XMLHttpRequest();
    oReq.open("GET", url, true);
    oReq.responseType = "arraybuffer";

    oReq.onload = function (oEvent) {
      callback(new Uint8Array(oReq.response));
    };

    oReq.send();

    // If `https` not in current url, replace `https` with `http` in above
    if (window.location.href.indexOf("http://") > -1) {
      url = url.replace("https://", "http://");
    }

    $.get(url, (replay, super_sucess) => {
      callback(replay);
    });
  }

  //----TOURNAMENTS----

  static getNextTournament(episode, callback) {
    return $.get(`${URL}/api/episode/${episode}/tournament/next/`)
      .done((data, status) => {
        callback(data);
      })
      .fail((xhr, status, error) => {
        console.log("Error in getting next tournament", xhr, status, error);
        callback(null);
      });
  }

  static getTournaments(callback) {
    $.get(`${URL}/api/${LEAGUE}/tournament/`).done((data, status) => {
      callback(data.results);
    });
  }

  //----AUTHENTICATION----

  // NOTE: The backend currently uses JWT, so we use that too.
  // Similar to OAuth2, JWT by default has 2 tokens, access and refresh
  // ! Currently, the frontend only uses a subset of JWT's features!
  // It only utilizes the access token, not the refresh token.
  // It also does not rely on timestamps to determine token expiry.
  // If the access token is invalid (eg expired), then render the page as logged-out,
  // and have the user enter their username and password to get a new access token.
  // (To enable this, the access token lasts for a long time. See the backend JWT setup)

  // For issues to track improving our token flow, see #168 and #169

  static logout() {
    Cookies.set("access", "");
    Cookies.set("refresh", "");
    Api.setLoginHeader();
    window.location.replace("/");
  }

  // Set authorization header based on the current cookie state, which is provided by
  // default for all subsequent requests. The header is a JWT token: see
  // https://django-rest-framework-simplejwt.readthedocs.io/en/latest/getting_started.html
  static setLoginHeader() {
    const access_token = Cookies.get("access");
    if (access_token) {
      $.ajaxSetup({
        headers: { Authorization: `Bearer ${access_token}` },
      });
    }
  }

  // Checks whether the currently held JWT access token is still valid (by posting it to the verify endpoint),
  // hence whether or not the frontend still has logged-in access.
  // "Returns" true or false, via callback.
  // Callers of this method should check this, before rendering their logged-in or un-logged-in versions.
  // If not logged in, then api calls will give 403s, and the website will tell you to log in anyways.
  static loginCheck(callback) {
    return $.post(`${URL}/api/token/verify/`, {
      token: Cookies.get("access"),
    })
      .done((data, status) => {
        // Set authorization header for all other requests
        callback(true);
      })
      .fail((xhr, status, error) => {
        callback(false);
      });
  }

  // Our login (and token) flow currently uses a subset of JWT features
  // see the comment block under the "AUTHORIZATION" comment header
  static login(username, password, callback) {
    return $.post(`${URL}/api/token/`, {
      username,
      password,
    })
      .done((data, status) => {
        Cookies.set("access", data.access);
        Cookies.set("refresh", data.refresh);

        callback(data, true);
      })
      .fail((xhr, status, error) => {
        console.log("Error in logging in: ", xhr, status, error);
        // if responseJSON is undefined, it is probably because the API is not configured
        // check that the API is indeed running on URL (localhost:8000 if local development)
        callback(xhr.responseJSON.detail, false);
      });
  }

  static register(user, callback) {
    return $.ajax({
      url: `${URL}/api/user/u/`,
      data: JSON.stringify(user),
      type: "POST",
      contentType: "application/json",
      dataType: "json",
    })
      .done((data, status) => {
        this.login(user.username, user.password, callback);
      })
      .fail((xhr, status, error) => {
        callback(xhr.responseJSON, false);
      });
  }

  static doResetPassword(password, token, callback) {
    var req = {
      password: password,
      token: token,
    };

    $.post(`${URL}/api/user/password_reset/confirm/`, req, (data, success) => {
      callback(data, success);
    }).fail((xhr, status, error) => {
      callback(xhr.responseJSON, false);
    });
  }

  static forgotPassword(email, callback) {
    $.post(`${URL}/api/user/password_reset/`, {
      email,
    })
      .done((data, success) => {
        callback(data, success);
      })
      .fail((xhr, status, error) => {
        callback(xhr.responseJSON.email, false);
      });
  }

  static pushTeamCode(code, callback) {
    this.updateTeam({ code }, callback);
  }
}

export default Api;
