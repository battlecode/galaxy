import React, { Component } from "react";
import Api from "../api";

import PaginationControl from "./paginationControl";
import Spinner from "./spinner";
import { getDateTimeText } from "../utils/date";

const SUBMISSION_STATUS = {
  NEW: "Created",
  QUE: "Queued",
  RUN: "Verifying",
  TRY: "Will be retried",
  "OK!": "Success",
  ERR: "Failed",
  CAN: "Cancelled",
};

const SUBMISSION_ACCEPTED = {
  true: "Accepted",
  false: "Rejected",
};

class SubmissionList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      submissions: [],
      page: 1,
      pageLimit: 1,
      loading: true,
    };
  }

  componentDidMount() {
    this.getPage(this.state.page);
  }

  getPage = (page) => {
    this.setState({ submissions: [], page, loading: true });
    const getter = this.props.tournament
      ? Api.getTournamentSubmissions
      : Api.getSubmissions;
    getter(this.props.episode, page, (data, pageLimit) => {
      // This check handles the case where a new page is requested while a
      // previous page was loading.
      if (page == this.state.page) {
        this.setState({ submissions: data.results, pageLimit, loading: false });
      }
    });
  };

  refreshCurrentPage = () => {
    this.getPage(this.state.page);
    $("#submission-table-refresh-button").blur();
  };

  renderTable() {
    const rows = this.state.submissions.map((submission) => {
      const created_date_text = getDateTimeText(new Date(submission.created));
      const created_date_string = created_date_text.local_full_string;
      return (
        <tr key={submission.id}>
          {this.props.tournament ? (
            <td>
              {
                (this.props.tournament_info ?? []).filter((t) => {
                  return t.name_short == submission.tournament;
                })[0]?.name_long
              }
            </td>
          ) : (
            ""
          )}
          <td>{created_date_string}</td>
          {this.props.tournament ? (
            ""
          ) : (
            <td>
              {submission.status == "OK!"
                ? SUBMISSION_ACCEPTED[submission.accepted]
                : SUBMISSION_STATUS[submission.status]}
            </td>
          )}
          <td>{submission.description} </td>
          <td>{submission.package}</td>
          <td>{submission.username} </td>
          {this.props.tournament ? (
            ""
          ) : (
            <td>
              {" "}
              <a
                style={{ cursor: "pointer" }}
                onClick={($event) => {
                  // Prevent default behavior when clicking a link
                  $event.preventDefault();

                  let fileURL = URL.createObjectURL(
                    new Blob([submission.logs], { type: "text/plain" })
                  );
                  window.open(fileURL);
                }}
                target="_blank"
                rel="noopener noreferrer"
              >
                View log
              </a>{" "}
            </td>
          )}
          <td>
            {" "}
            <button
              className="btn btn-xs"
              onClick={() =>
                Api.downloadSubmission(submission.id, this.props.episode)
              }
            >
              Download
            </button>
          </td>
        </tr>
      );
    });

    return (
      <div className="content">
        <button
          id="submission-table-refresh-button"
          className="btn btn-xs"
          onClick={this.refreshCurrentPage}
        >
          Refresh
        </button>
        <table className="table table-hover table-striped table-responsive table-full-width">
          <thead>
            <tr>
              {this.props.tournament ? <th>Tournament</th> : ""}
              <th>Submitted at</th>
              {this.props.tournament ? "" : <th>Status</th>}
              <th>Description</th>
              <th>Package Name</th>
              <th>Submitter</th>
              {this.props.tournament ? "" : <th></th>}
              <th></th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>
        {this.state.loading && <Spinner />}
        <PaginationControl
          page={this.state.page}
          pageLimit={this.state.pageLimit}
          onPageClick={this.getPage}
        />
      </div>
    );
  }

  render() {
    return (
      <div className="card">
        <div className="header">
          <h4 className="title">
            {this.props.tournament
              ? "Tournament Submission History"
              : "Submission History"}
          </h4>
          {this.props.tournament && this.props.episode_info.frozen ? (
            <p>
              Submissions are currently frozen. Your last accepted submission
              will be entered into the next tournament. The list of your
              tournament submissions will be updated here soon!
            </p>
          ) : (
            ""
          )}
        </div>
        {this.renderTable()}
      </div>
    );
  }
}

export default SubmissionList;
