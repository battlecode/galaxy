import React, { Component } from "react";
import Api from "../api";
import Countdown from "../components/countdown";
import ActionMessage from "../components/actionMessage";
import Alert from "../components/alert";

const COMPILATION_STATUS = {
  PROGRESS: 0,
  SUCCESS: 1,
  FAIL: 2,
  ERROR: 3,
  UPLOADED: 4,
  QUEUED: 5,
};

class Submissions extends Component {
  //----INITIALIZATION----
  constructor(props) {
    super(props);
    this.state = {
      selectedFile: null,
      currentSubmission: null,
      package: "",
      description: "",
      lastSubmissions: null,
      tourSubmissions: null,
      numLastSubmissions: 0,
      numLastLoaded: 0,
      numTourSubmissions: 0,
      numTourLoaded: 0,
      upload_status: "waiting",
      alert_message: "",
    };

    this.changeHandler = this.changeHandler.bind(this);
  }

  changeHandler(e) {
    const id = e.target.id;
    const val = e.target.value;

    this.setState(function (prevState, props) {
      prevState[id] = val;
      return prevState;
    });
  }

  componentDidMount() {
    Api.getTeamSubmissions(this.gotSubmissions);

    // Set up submission deadline text
    Api.getNextTournament(this.props.episode, (tournamentInfo) => {
      this.setState({ tournamentInfo });
    });
  }

  componentWillUnmount() {
    // don't leak memory
    clearInterval(this.interval);
  }

  //----UPLOADING FILES----

  // makes an api call to upload the selected file
  uploadData = () => {
    this.setState({ upload_status: "loading" });
    Api.newSubmission(
      this.state.selectedFile,
      this.state.package,
      this.state.description,
      this.props.episode,
      (success) => {
        if (success) {
          this.setState({
            upload_status: "success",
            package: "",
            description: "",
            selectedFile: null,
          });
        } else {
          this.setState({
            alert_message:
              "Submission upload was not successful, most likely due to a submission freeze.",
          });
          this.setState({ upload_status: "failure" });
        }
        // re-render submission table after;
        // as part of #387 for tracking
        setTimeout(() => {
          this.setState({ upload_status: "waiting" });
        }, 2000);
      }
    );
  };

  // change handler called when file is selected
  fileChangeHandler = (event) => {
    this.setState({
      selectedFile: event.target.files[0],
    });
  };

  //---GETTING TEAMS SUBMISSION DATA----
  KEYS_CURRENT = ["compiling"];
  KEYS_LAST = ["last_1", "last_2", "last_3"];
  KEYS_TOUR = [
    "tour_final",
    "tour_qual",
    "tour_seed",
    "tour_sprint",
    "tour_hs",
    "tour_intl_qual",
    "tour_newbie",
  ];

  // called when submission data is initially received
  // this will be maps of the label of type of submission to submission id
  // this function then makes calls to get the specific data for each submission
  gotSubmissions = (data) => {
    this.setState({
      currentSubmission: new Array(
        this.submissionHelper(this.KEYS_CURRENT, data)
      ).fill({}),
    });
    this.setState({
      lastSubmissions: new Array(
        this.submissionHelper(this.KEYS_LAST, data)
      ).fill({}),
    });
    this.setState({
      tourSubmissions: new Array(
        this.submissionHelper(this.KEYS_TOUR, data)
      ).fill([]),
    });
  };

  // makes api call for submission with each key in data, returns the number of submissions
  // that actually exist in the data
  submissionHelper(keys, data) {
    let null_count = 0;
    for (var i = 0; i < keys.length; i++) {
      if (data[keys[i]] !== null && data[keys[i]] !== undefined) {
        Api.getSubmission(data[keys[i]], this.setSubmissionData, keys[i]);
        null_count++;
      }
    }

    return null_count;
  }

  // sets submission data for the given key, if all submissions have been found force updates state
  setSubmissionData = (key, data) => {
    let index, add_data;
    if (this.KEYS_CURRENT.includes(key)) {
      index = 0;
      const arr = this.state["currentSubmission"];
      let newArr = arr.slice(0, index);
      newArr.push(data);
      this.setState({
        ["currentSubmission"]: newArr.concat(arr.slice(index + 1)),
      });
    } else if (this.KEYS_LAST.includes(key)) {
      switch (key) {
        case "last_1":
          index = 0;
          break;
        case "last_2":
          index = 1;
          break;
        case "last_3":
          index = 2;
          break;
      }

      const arr = this.state["lastSubmissions"];
      let newArr = arr.slice(0, index);
      newArr.push(data);
      this.setState({
        ["lastSubmissions"]: newArr.concat(arr.slice(index + 1)),
      });
    } else {
      switch (key) {
        case "tour_sprint":
          add_data = ["Sprint 1", data];
          break;
        case "tour_seed":
          add_data = ["Sprint 2", data];
          break;
        case "tour_qual":
          add_data = ["Qualifying", data];
          break;
        case "tour_final":
          add_data = ["Final", data];
          break;
        case "tour_hs":
          add_data = ["US High School", data];
          break;
        case "tour_intl_qual":
          add_data = ["International Qualifying", data];
          break;
        case "tour_newbie":
          add_data = ["Newbie", data];
          break;
      }

      const arr = this.state["tourSubmissions"];
      let end = arr.slice(1);
      end.push(add_data);
      this.setState({ ["tourSubmissions"]: end });
    }
  };

  // Downloads the file for given submission id
  onSubFileRequest = (subId, fileNameAddendum) => {
    Api.downloadSubmission(subId, fileNameAddendum, null);
  };

  //----PERMISSIONS----
  isSubmissionEnabled() {
    // Submissions are only enabled when on a team,
    // and when either [user is staff] or [the episode is released and not frozen].

    // NOTE: There is an edge case when in the backend,
    // the episode is truly frozen since a submission deadline has passed,
    // but the frontend may not know of that since it hasn't queried the backend since the deadline.
    // So we must be careful that _independently of the frontend's stored value of frozen,
    // submissions attempted during a submission freeze still fail gracefully_.

    return (
      this.props.on_team &&
      ((this.props.is_game_released && !this.props.episode_info.frozen) ||
        this.props.is_staff)
    );
  }

  //----RENDERING----

  closeAlert = () => {
    this.setState({ alert_message: "" });
  };

  // return div for submitting files, should be able to disable this when submissions are not being accepts
  renderHelperSubmissionForm() {
    if (this.isSubmissionEnabled()) {
      // Submission upload button logic
      const submission_inputted = this.state.selectedFile !== null;
      const submission_input_name = !submission_inputted
        ? "No file chosen."
        : this.state.selectedFile["name"];
      const submission_btn_class =
        "btn btn" + (!submission_inputted ? "" : " btn-info btn-fill");

      const submission_input_label = (
        <label htmlFor="submission_file_attach">
          <div className="btn"> Choose File </div>{" "}
          <span
            style={{
              textTransform: "none",
              marginLeft: "10px",
              fontSize: "14px",
            }}
          >
            {" "}
            {submission_input_name}{" "}
          </span>
        </label>
      );

      const submission_input = (
        <input
          id="submission_file_attach"
          type="file"
          accept=".zip"
          onChange={this.fileChangeHandler}
          style={{ display: "none" }}
        />
      );

      const submission_upload_btn_disabled =
        !submission_inputted ||
        ["success", "loading", "failure"].includes(this.state.upload_status);

      const submission_upload_button = (
        <button
          disabled={submission_upload_btn_disabled}
          style={{ float: "right" }}
          onClick={this.uploadData}
          className={submission_btn_class}
        >
          {" "}
          <ActionMessage
            default_message="Upload Submission"
            status={this.state.upload_status}
          />{" "}
        </button>
      );

      const submission_row = (
        <div className="row">
          <div className="col-md-12">
            <div className="form-group">
              <label>Submission</label>
              <br />
              {submission_input_label}
              {submission_input}
              {submission_upload_button}
            </div>
          </div>
        </div>
      );

      const submission_info_row = (
        <div className="row">
          <div className="col-md-2">
            <div className="form-group">
              <label>Package Name</label>
              <input
                type="text"
                className="form-control"
                id="package"
                onChange={this.changeHandler}
                value={this.state.package}
              />
            </div>
          </div>
          <div className="col-md-10">
            <div className="form-group">
              <label>Description</label>
              <input
                type="text"
                className="form-control"
                id="description"
                onChange={this.changeHandler}
                value={this.state.description}
              />
            </div>
          </div>
        </div>
      );

      return (
        <div className="card">
          <div className="header">
            <h4 className="title">Submit Code</h4>
          </div>
          <div className="content">
            <p>Submit your code using the button below.</p>
            <p>
              Create a <code>zip</code> file of your robot player, and submit it
              below. The submission format should be a zip file containing a
              single folder (which is your package name), which should contain
              RobotPlayer.java and any other code you have written, for example:
            </p>
            <pre>
              <code>
                submission.zip --{">"} examplefuncsplayer --{">"}{" "}
                RobotPlayer.java, FooBar.java
              </code>
            </pre>
            {submission_row}
            {submission_info_row}
          </div>
        </div>
      );
    } else {
      return (
        <div className="card">
          <div className="header">
            <h4 className="title">Submit Code</h4>
          </div>
          <div className="content">
            <p>Submissions are currently disabled! Check back later.</p>
          </div>
        </div>
      );
    }
  }

  // Shows the status of a current submission upload in progress.
  // (see uploadData() for more explanation)
  renderHelperSubmissionStatus() {
    if (this.isSubmissionEnabled()) {
      let status_str = "";
      switch (this.state.upload_status) {
        case -1:
          status_str = "Waiting to start submission...";
          break;
        case 10:
          status_str = "Currently submitting...";
          break;
        case 11:
          status_str = "Successfully queued for compilation!";
          break;
        case 12:
          status_str = "Files cannot be submitted without a team.";
          break;
        case 13:
          status_str = "Submitting failed. Try re-submitting your code.";
          break;
        default:
          status_str = "";
          break;
      }

      return (
        <div className="card">
          <div className="content">
            <p id="upload_status" className="text-center category">
              {" "}
              {status_str}
            </p>
          </div>
        </div>
      );
    }
  }

  // render helper for table containing the team's latest submission
  renderHelperCurrentTable() {
    if (this.state.currentSubmission === null) {
      return (
        <p className="text-center category">
          Loading submissions...
          <br />
          <br />
        </p>
      );
    } else if (this.state.currentSubmission.length == 0) {
      return <p>You haven't submitted any code yet!</p>;
    } else {
      const submissionRows = this.state.currentSubmission.map(
        (submission, index) => {
          if (Object.keys(submission).length === 0) {
            return (
              <tr key="current">
                <td>
                  {" "}
                  <div className="btn btn-xs" style={{ visibility: "hidden" }}>
                    Loading...
                  </div>
                </td>
                <td></td>
              </tr>
            );
          } else {
            let status_str = "";
            let download_button = (
              <button
                className="btn btn-xs"
                onClick={() => this.onSubFileRequest(submission.id, index + 1)}
              >
                Download
              </button>
            );
            switch (submission.compilation_status) {
              case COMPILATION_STATUS.PROGRESS:
                status_str =
                  "Submission initialized, but not yet uploaded... If this persists, try re-submitting your code. Also, make sure to stay on this page.";
                download_button = "";
                break;
              case COMPILATION_STATUS.SUCCESS:
                status_str = "Successfully submitted and compiled!";
                break;
              case COMPILATION_STATUS.FAIL:
                status_str =
                  "Submitted, but compiler threw a compile error. Fix and re-submit your code.";
                break;
              case COMPILATION_STATUS.ERROR:
                status_str =
                  "Internal server error. Try re-submitting your code. If this persists, try reading the compilation logs, checking your submission's structure, or asking a dev.";
                break;
              case COMPILATION_STATUS.UPLOADED:
                status_str =
                  "Code uploaded, but not yet queued for compilation... If this persists, try re-submitting your code.";
                break;
              case COMPILATION_STATUS.QUEUED:
                // A dedicated refresh button, that refreshes only these tables, would be cool
                // See #35 for tracking
                status_str =
                  "Code queued for compilation -- check back and refresh for updates.";
                break;
              default:
                status_str = "";
                break;
            }
            return (
              <tr key={submission.id + "-current"}>
                <td>{new Date(submission.submitted_at).toLocaleString()}</td>
                <td>
                  {status_str + " "}
                  {submission.compilation_status === COMPILATION_STATUS.FAIL ||
                  submission.compilation_status === COMPILATION_STATUS.ERROR ? (
                    <a
                      style={{ cursor: "pointer" }}
                      onClick={($event) => {
                        // Prevent default behavior when clicking a link
                        $event.preventDefault();

                        Api.getSubmissionLog(submission.id, function (data) {
                          let fileURL = URL.createObjectURL(
                            new Blob([data], { type: "text/plain" })
                          );
                          window.open(fileURL);
                        });
                      }}
                      // href={submission.url + "log/"}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View log here
                    </a>
                  ) : (
                    <div></div>
                  )}
                </td>
                <td>{download_button} </td>
              </tr>
            );
          }
        }
      );

      return (
        <table className="table table-hover table-striped">
          <thead>
            <tr>
              <th>Submission at</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>{submissionRows}</tbody>
        </table>
      );
    }
  }

  // render helper for table containing the team's latest successfully compiled submissions
  renderHelperLastTable() {
    if (this.state.lastSubmissions === null) {
      return (
        <p className="text-center category">
          Loading submissions...
          <br />
          <br />
        </p>
      );
    } else if (this.state.lastSubmissions.length == 0) {
      return (
        <p>
          You haven't had any successful submissions yet! (If you have code
          being submitted, you'll see it here if it finishes successfully.)
        </p>
      );
    } else {
      const submissionRows = this.state.lastSubmissions.map(
        (submission, index) => {
          if (Object.keys(submission).length === 0) {
            return (
              <tr key={"loading-last-" + index}>
                <td>
                  {" "}
                  <div className="btn btn-xs" style={{ visibility: "hidden" }}>
                    Loading...
                  </div>
                </td>
                <td></td>
              </tr>
            );
          } else {
            return (
              <tr key={submission.id + "-last"}>
                <td>{new Date(submission.submitted_at).toLocaleString()}</td>
                <td>
                  {" "}
                  <button
                    className="btn btn-xs"
                    onClick={() =>
                      this.onSubFileRequest(submission.id, index + 1)
                    }
                  >
                    Download
                  </button>{" "}
                </td>
              </tr>
            );
          }
        }
      );

      return (
        <table className="table table-hover table-striped">
          <thead>
            <tr>
              <th>Submission at</th>
            </tr>
          </thead>
          <tbody>{submissionRows}</tbody>
        </table>
      );
    }
  }

  // render helper for table containing the team's tournament submissions
  renderHelperTourTable() {
    if (this.state.tourSubmissions === null) {
      return (
        <p className="text-center category">
          Loading submissions...
          <br />
          <br />
        </p>
      );
    } else if (this.state.tourSubmissions.length === 0) {
      return (
        <p>
          Code submitted to tournaments will appear here after the tournament.
        </p>
      );
    } else {
      let tourRows = this.state.tourSubmissions.map((submission, index) => {
        if (submission.length === 0) {
          return (
            <tr key={index + "-tour-loading"}>
              <td>
                {" "}
                <div className="btn btn-xs" style={{ visibility: "hidden" }}>
                  Loading...
                </div>
              </td>
              <td></td>
              <td></td>
            </tr>
          );
        } else {
          return (
            <tr key={submission[1].id + "-tour-" + submission[0]}>
              <td>{submission[0]}</td>
              <td>{new Date(submission[1].submitted_at).toLocaleString()}</td>
              <td>
                {" "}
                <button
                  className="btn btn-xs"
                  onClick={() =>
                    this.onSubFileRequest(submission[1].id, submission[0])
                  }
                >
                  Download
                </button>{" "}
              </td>
            </tr>
          );
        }
      });

      return (
        <table className="table table-hover table-striped">
          <thead>
            <tr>
              <th>Tournament</th>
              <th>Submission Time</th>
            </tr>
          </thead>
          <tbody>{tourRows}</tbody>
        </table>
      );
    }
  }

  render() {
    return (
      <div className="content">
        <Alert
          alert_message={this.state.alert_message}
          closeAlert={this.closeAlert}
        />
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-12">
              <Countdown
                game_release={this.props.episode_info.game_release}
                episode={this.props.episode}
                is_game_released={this.props.is_game_released}
              >
                {" "}
              </Countdown>
              {this.renderHelperSubmissionForm()}
              {/* See #387 for tracking */}
              {/* {this.renderHelperSubmissionStatus()} */}

              {/* See #387 for tracking */}
              {/* <div className="card">
                <div className="header">
                  <h4 className="title">Latest Submission</h4>
                </div>
                <div className="content">{this.renderHelperCurrentTable()}</div>
                <div className="header">
                  <h4 className="title">
                    Latest Successfully Compiled Submissions
                  </h4>
                </div>
                <div className="content">{this.renderHelperLastTable()}</div>
              </div> */}

              {/* See #78 for tracking */}
              {/* <div className="card">
                <div className="header">
                  <h4 className="title">Tournament Submissions</h4>
                </div>
                <div className="content">{this.renderHelperTourTable()}</div>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Submissions;
