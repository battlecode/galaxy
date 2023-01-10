import React, { Component } from "react";
import $ from "jquery";

import Api from "../api";
import Countdown from "../components/countdown";
import ActionMessage from "../components/actionMessage";
import Alert from "../components/alert";
import SubmissionList from "../components/submissionList";

import { print_errors } from "../utils/error_handling";

class Submissions extends Component {
  //----INITIALIZATION----
  constructor(props) {
    super(props);
    this.state = {
      selectedFile: null,
      currentSubmission: null,
      package: "",
      description: "",
      upload_status: "waiting",
      alert_message: "",
    };

    this.submission_list = (
      <SubmissionList episode={this.props.episode}> </SubmissionList>
    );

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
    // Api.getTeamSubmissions(this.gotSubmissions);

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
      (response, success) => {
        if (success) {
          this.setState({
            upload_status: "success",
            package: "",
            description: "",
            selectedFile: null,
          });
        } else {
          let alert_message = print_errors(response);
          // During submission freeze, backend gives an unhelpful error...
          // to mitigate:
          if (response.responseJSON && response.responseJSON.detail) {
            alert_message +=
              "\nThis is most likely due to a submission freeze.";
          }
          this.setState({
            alert_message,
          });
          this.setState({ upload_status: "failure" });
        }
        $("#submission-table-refresh-button").click();
        setTimeout(() => {
          this.setState({ upload_status: "waiting" });
        }, 2000);
      }
    );
  };

  // change handler called when file is selected
  fileChangeHandler = (event) => {
    this.setState(
      {
        // In case of a cancel, event.target.files[0] could be undefined.
        // For type-safety and simplicity, we store a null instead.
        selectedFile: event.target.files[0] ? event.target.files[0] : null,
      },
      () => {
        // Clear the input element's stored file,
        // so that uploading the same file again still fires the onChange handler.
        // This allows for uploading the same file and re-setting the state,
        // which is useful after we clear state on successful submission.
        // (Note that we have saved this file in state anyways)
        // See https://stackoverflow.com/a/42192710
        event.target.value = null;
      }
    );
  };

  //---GETTING TEAMS SUBMISSION DATA----

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

  // return div for submitting files
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
            </div>
          </div>
        </div>
      );

      const submission_info_row = (
        <div className="row">
          <div className="col-md-4">
            <div className="form-group">
              <label>Package Name (where is RobotPlayer?)</label>
              <input
                type="text"
                className="form-control"
                id="package"
                onChange={this.changeHandler}
                value={this.state.package}
              />
            </div>
          </div>
          <div className="col-md-8">
            <div className="form-group">
              <label>Description (for your reference)</label>
              <input
                type="text"
                className="form-control"
                id="description"
                onChange={this.changeHandler}
                value={this.state.description}
              />
            </div>
          </div>
          <div className="col-md-12">
            <div className="form-group">{submission_upload_button}</div>
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
            {this.props.episode_info.frozen && (
              <p>
                This is most likely due to a submission freeze for a tournament.
                (If you think the freeze has passed, try refreshing the page.)
              </p>
            )}
          </div>
        </div>
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
              {this.submission_list}

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
