import React, { Component } from "react";
import Api from "../api";

import PaginationControl from "./paginationControl";
import Spinner from "./spinner";

class SubmissionList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      submissions: null,
    };
    Api.getSubmissions(this.props.episode, (data) => {
      this.setState({ submissions: data.results });
    });
  }

  renderTable() {
    if (this.state.submissions === null) {
      return (
        <div className="content">
          <Spinner />
        </div>
      );
    } else if (this.state.submissions.length === 0) {
      return (
        <div className="content">
          <h4 className="title">Your team has not made any submissions yet.</h4>
        </div>
      );
    } else {
      const rows = this.state.submissions.map((submission) => {
        console.log(submission);
        return (
          <tr key={submission.id}>
            <td> {submission.created}</td>
            <td>{submission.status} </td>

            <td>{submission.description} </td>
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
                  Api.downloadSubmission(
                    submission.id,
                    this.props.episode,
                    "zip"
                  )
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
          <table className="table table-hover table-striped table-responsive table-full-width">
            <thead>
              <tr>
                <th>Submitted at</th>
                <th>Status</th>
                <th>Description</th>
                <th>Submitter</th>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody>{rows}</tbody>
          </table>
          <PaginationControl
          // page={props.page}
          // pageLimit={props.pageLimit}
          // onPageClick={props.onPageClick}
          />
        </div>
      );
    }
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
