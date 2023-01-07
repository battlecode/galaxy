import React, { Component } from "react";
import Api from "../api";

import PaginationControl from "./paginationControl";
import Spinner from "./spinner";

const SUBMISSION_STATUS = {
  NEW: "Created",
  QUE: "Queued",
  RUN: "Running",
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
    Api.getSubmissions(this.props.episode, page, (data, pageLimit) => {
      // This check handles the case where a new page is requested while a
      // previous page was loading.
      if (page == this.state.page) {
        console.log(data);
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
      return (
        <tr key={submission.id}>
          <td>{new Date(submission.created).toLocaleString()}</td>
          <td>
            {submission.status == "OK!" &&
              SUBMISSION_ACCEPTED[submission.accecpted.toString()]}
            {submission.status != "OK!" && SUBMISSION_STATUS[submission.status]}
          </td>
          <td>{submission.description} </td>
          <td>{submission.package}</td>
          <td>{submission.username} </td>
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
              <th>Submitted at</th>
              <th>Status</th>
              <th>Description</th>
              <th>Package Name</th>
              <th>Submitter</th>
              <th></th>
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
          <h4 className="title">Submission History</h4>
        </div>
        {this.renderTable()}
      </div>
    );
  }
}

export default SubmissionList;
