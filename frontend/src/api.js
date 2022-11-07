import $ from "jquery";
import Cookies from "js-cookie";

// do not change URL here!! rather, for development, change it in ../.env.development
const URL = process.env.REACT_APP_BACKEND_URL;
const LEAGUE = 0;
const PAGE_LIMIT = 10;
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

// NOTE: CHANGE THESE FOR EVERY UPCOMING TOURNAMENT AND DEADLINE
// Note the UTC timezone, change for daylight savings, etc, as necessary
// (UTC-5 is the usual timezone for Cambridge in January)
const HAS_NEXT_TOUR = false;
const NEXT_TOUR_SUBMISSION_DEADLINE = new Date(
  "January 27, 2022 19:00:00-5:00"
);
// If there are two tournaments with the same deadline,
// then on frontend, treat them as one tournament w a plural name, eg "Final Tournaments".
// (This should get accounted for in #75)
const NEXT_TOUR_NAME = "Final Tournaments";
const DOES_TOUR_REQUIRE_RESUME = true;

class Api {
  static testSetOutcome() {}

  //----SUBMISSIONS----

  //uploads a new submission to the google cloud bucket
  static newSubmission(submissionfile, callback) {
    // First check if the user is part of a team
    if (Cookies.get("team_id") === null) {
      alert(
        "File cannot be submitted without a team. (If you think you're on a team, check that your cookies are enabled."
      );
      return;
    }

    // URLs which files are uploaded to are generated by the backend;
    // call the backend api to get this link
    $.post(`${URL}/api/${LEAGUE}/submission/`)
      .done((data, status) => {
        // Upload to the bucket
        Cookies.set("submission_id", data["submission_id"]);
        $.ajax({
          url: data["upload_url"],
          method: "PUT",
          data: submissionfile,
          processData: false,
          contentType: false,
        })
          .done((data, status) => {
            // After upload is done, need to queue for compilation.
            // See corresponding method of backend/api/views.py for more explanation.
            $.post(
              `${URL}/api/${LEAGUE}/submission/` +
                Cookies.get("submission_id") +
                `/compilation_pubsub_call/`
            )
              .done((data, status) => {
                Cookies.set("upload_status_cookie", 11);
              })
              .fail((xhr, status, error) => {
                console.log(
                  "Error in compilation update callback: ",
                  xhr,
                  status,
                  error
                );
                Cookies.set("upload_status_cookie", 13);
              });
          })
          .fail((xhr, status, error) => {
            console.log(
              "Error in put request of file to bucket: ",
              xhr,
              status,
              error
            );
            Cookies.set("upload_status_cookie", 13);
          });
      })
      .fail((xhr, status, error) => {
        console.log("Error in post request for upload: ", xhr, status, error);
        Cookies.set("upload_status_cookie", 13);
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

  static getUpcomingDates(callback) {
    const newState = [
      { id: 0, date: "hi", data: "message" },
      { id: 1, date: "24", data: "message2" },
    ];

    callback(newState);
  }

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

  static getLeague(callback) {
    $.get(`${URL}/api/league/${LEAGUE}/`).done((data, status) => {
      Cookies.set("league_url", data.url);
      $.get(data.url)
        .done((data, success) => {
          callback(data);
        })
        .fail((xhr, status, error) => {
          console.log("Error in getting league: ", xhr, status, error);
        });
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

  // Unused and deprecated.
  // Kept in case we want to use it again; might require updates to code
  // static search(query, callback) {
  //   const encodedQuery = encodeURIComponent(query);
  //   const teamUrl = `${URL}/api/${LEAGUE}/team/?search=${encodedQuery}&page=1`;
  //   const userUrl = `${URL}/api/user/profile/?search=${encodedQuery}&page=1`;
  //   $.get(teamUrl, (teamData) => {
  //     $.get(userUrl, (userData) => {
  //       const teamLimit =
  //         parseInt(teamData.count / PAGE_LIMIT, 10) +
  //         !!(teamData.count % PAGE_LIMIT);
  //       const userLimit =
  //         parseInt(userData.count / PAGE_LIMIT, 10) +
  //         !!(userData.count % PAGE_LIMIT);
  //       callback({
  //         users: userData.results,
  //         userLimit,
  //         userPage: 1,
  //         teams: teamData.results,
  //         teamLimit,
  //         teamPage: 1,
  //       });
  //     });
  //   });
  // }

  static searchTeamRanking(query, page, callback) {
    Api.searchRanking(`${URL}/api/${LEAGUE}/team`, query, page, callback);
  }

  static searchRanking(apiURL, query, page, callback) {
    const encQuery = encodeURIComponent(query);
    const teamUrl = `${apiURL}/?ordering=-score,name&search=${encQuery}&page=${page}`;
    $.get(teamUrl, (teamData) => {
      const teamLimit =
        parseInt(teamData.count / PAGE_LIMIT, 10) +
        !!(teamData.count % PAGE_LIMIT);
      callback({
        query,
        teams: teamData.results,
        teamLimit,
        teamPage: page,
      });
    });
  }

  static searchTeam(query, page, callback) {
    const encQuery = encodeURIComponent(query);
    const teamUrl = `${URL}/api/${LEAGUE}/team/?search=${encQuery}&page=${page}`;
    $.get(teamUrl, (teamData) => {
      const teamLimit =
        parseInt(teamData.count / PAGE_LIMIT, 10) +
        !!(teamData.count % PAGE_LIMIT);
      callback({
        query,
        teams: teamData.results,
        teamLimit,
        teamPage: page,
      });
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

  static getUserTeam(callback) {
    $.get(
      `${URL}/api/userteam/${encodeURIComponent(
        Cookies.get("username")
      )}/${LEAGUE}/`
    )
      .done((data, status) => {
        Cookies.set("team_id", data.id);
        Cookies.set("team_name", data.name);

        $.get(`${URL}/api/${LEAGUE}/team/${data.id}/`).done((data, status) => {
          callback(data);
        });
      })
      .fail((xhr, status, error) => {
        // possibly dangerous???
        callback(null);
      });
  }

  // updates team
  static updateTeam(params, callback) {
    $.ajax({
      url: `${URL}/api/${LEAGUE}/team/${Cookies.get("team_id")}/`,
      data: JSON.stringify(params),
      type: "PATCH",
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

  //----USER FUNCTIONS----

  static createTeam(team_name, callback) {
    $.post(`${URL}/api/${LEAGUE}/team/`, { name: team_name })
      .done((data, status) => {
        Cookies.set("team_id", data.id);
        Cookies.set("team_name", data.name);
        callback(true);
      })
      .fail((xhr, status, error) => {
        callback(false);
      });
  }

  static joinTeam(secret_key, team_name, callback) {
    $.get(
      `${URL}/api/${LEAGUE}/team/?search=${encodeURIComponent(team_name)}`,
      (team_data, team_success) => {
        let found_result = null;
        team_data.forEach((result) => {
          if (result.name === team_name) {
            found_result = result;
          }
        });
        if (found_result === null) return callback(false);
        $.ajax({
          url: `${URL}/api/${LEAGUE}/team/${found_result.id}/join/`,
          type: "PATCH",
          data: { team_key: secret_key },
        })
          .done((data, status) => {
            Cookies.set("team_id", data.id);
            Cookies.set("team_name", data.name);
            callback(true);
          })
          .fail((xhr, status, error) => {
            callback(false);
          });
      }
    );
  }

  static leaveTeam(callback) {
    $.ajax({
      url: `${URL}/api/${LEAGUE}/team/${Cookies.get("team_id")}/leave/`,
      type: "PATCH",
    })
      .done((data, status) => {
        callback(true);
      })
      .fail((xhr, status, error) => {
        callback(false);
      });
  }

  // This process will be touched up in #86
  // note that this is blocked by the new backend -- hold off for now
  static getUserProfile(callback) {
    $.get(`${URL}/api/user/detail/current/`)
      .done((data, status) => {
        callback(data);
      })
      .fail((xhr, status, error) => {
        console.log("Error in getting profile for user", xhr, status, error);
      });
  }

  static updateUser(profile, callback) {
    $.ajax({
      url: `${URL}/api/user/detail/current/`,
      data: JSON.stringify(profile),
      type: "PATCH",
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

  static resumeUpload(resume_file, callback) {
    $.post(`${Cookies.get("user_url")}resume_upload/`, (data, succcess) => {
      $.ajax({
        url: data["upload_url"],
        method: "PUT",
        data: resume_file,
        processData: false,
        contentType: false,
      });
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

  static getScrimmageRequests(callback) {
    this.getPendingScrimmages((scrimmages) => {
      const requests = scrimmages.map((scrimmage) => {
        const { blue_team, red_team } = scrimmage;
        return {
          id: scrimmage.id,
          team_id: scrimmage.requested_by,
          team: Cookies.get("team_name") === red_team ? blue_team : red_team,
        };
      });
      callback(requests);
    });
  }

  static requestScrimmage(teamId, callback) {
    $.post(`${URL}/api/${LEAGUE}/scrimmage/`, {
      red_team: Cookies.get("team_id"),
      blue_team: teamId,
      ranked: false,
    })
      .done((data, status) => {
        callback(teamId, true);
      })
      .fail((jqXHR, status, error) => {
        alert(JSON.parse(jqXHR.responseText).message);
        callback(teamId, false);
      });
  }

  static getAllTeamScrimmages(callback) {
    $.get(`${URL}/api/${LEAGUE}/scrimmage/`, (data, success) => {
      callback(data);
    });
  }

  static getPendingScrimmages(callback) {
    $.get(`${URL}/api/${LEAGUE}/scrimmage/?pending=1`, (data, success) => {
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

  static getDateTimeText(date) {
    // Use US localization for standardization in date format
    const est_string = date.toLocaleString("en-US", {
      timeZone: "EST",
    });
    // need to pass weekday here, since weekday isn't shown by default
    const est_day_of_week = date.toLocaleString("en-US", {
      timeZone: "EST",
      weekday: "short",
    });
    const est_date_str = `${est_day_of_week}, ${est_string} Eastern Time`;

    // Allow for localization here
    const locale_string = date.toLocaleString();
    const locale_day_of_week = date.toLocaleString([], {
      weekday: "short",
    });
    const local_date_str = `${locale_day_of_week}, ${locale_string} in your locale and time zone`;

    return { est_date_str: est_date_str, local_date_str: local_date_str };
  }

  static getNextTournament(callback) {
    // These dates are for submission deadlines, not tournaments!
    // Will be made dynamic and better, see #75

    callback({
      has_next_tournament: HAS_NEXT_TOUR,
      // for #75: API spec design notes: ^ should return false if there is no tour deadline in DB,
      // or if the latest tour (/ all tour) deadlines have passed.
      // Return true otherwise.
      submission_deadline: NEXT_TOUR_SUBMISSION_DEADLINE,
      submission_deadline_strs: this.getDateTimeText(
        NEXT_TOUR_SUBMISSION_DEADLINE
      ),
      tournament_name: NEXT_TOUR_NAME,
      does_tour_require_resume: DOES_TOUR_REQUIRE_RESUME,
      // This should be included in the real API response, for #75
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
    $.ajaxSetup({
      headers: { Authorization: `Bearer ${Cookies.get("access")}` },
    });
  }

  // Checks whether the currently held JWT access token is still valid (by posting it to the verify endpoint),
  // hence whether or not the frontend still has logged-in access.
  // "Returns" true or false, via callback.
  // Callers of this method should check this, before rendering their logged-in or un-logged-in versions.
  // If not logged in, then api calls will give 403s, and the website will tell you to log in anyways.
  static loginCheck(callback) {
    $.post(`${URL}/api/token/verify/`, {
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

  static verifyAccount(registrationKey, callback) {
    const userId = encodeURIComponent(Cookies.get("username"));
    $.post(
      `${URL}/api/verify/${userId}/verifyUser/`,
      {
        registration_key: registrationKey,
      },
      (data, success) => {
        callback(data, success);
      }
    );
  }

  // Our login (and token) flow currently uses a subset of JWT features
  // see the comment block under the "AUTHORIZATION" comment header
  static login(username, password, callback) {
    $.post(`${URL}/api/token/`, {
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

  static register(email, username, password, first, last, dob, callback) {
    $.post(`${URL}/api/user/`, {
      // TODO generate the JSON in the register page, see there
      // TODO change all variable names to exactly match the fields that backend expects
      // so that we can use JSON.stringify
      // (see account.js for a good example)
      // It'd be better to generally pick one way of doing things,
      // and stringify is generally better
      email,
      username,
      password,
      first_name: first,
      last_name: last,
      date_of_birth: dob,
    })
      .done((data, status) => {
        this.login(username, password, callback);
      })
      .fail((xhr, status, error) => {
        if (xhr.responseJSON.username)
          callback(xhr.responseJSON.username, false);
        else if (xhr.responseJSON.email)
          callback(xhr.responseJSON.email, false);
        else {
          callback("there was an error", false);
        }
      });
  }

  static doResetPassword(password, token, callback) {
    var req = {
      password: password,
      token: token,
    };

    $.post(`${URL}/api/password_reset/confirm/`, req, (data, success) => {
      callback(data, success);
    }).fail((xhr, status, error) => {
      console.log(
        "Error in API call for resetting password: ",
        xhr,
        status,
        error
      );
    });
  }

  static forgotPassword(email, callback) {
    $.post(
      `${URL}/api/password_reset/`,
      {
        email,
      },
      (data, success) => {
        callback(data, success);
      }
    );
  }

  static pushTeamCode(code, callback) {
    this.updateTeam({ code }, callback);
  }
}

export default Api;
