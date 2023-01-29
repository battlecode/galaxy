import React, { Component } from "react";
import ActionMessage from "./actionMessage";

class ReportUpload extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedReportFile: null,
      status: "waiting",
    };

    this.uploadReport = this.uploadReport.bind(this);
  }

  fileChangeHandler = (event) => {
    this.setState({
      selectedReportFile: event.target.files[0],
      loaded: 0,
    });
  };

  uploadReport() {
    this.setState({ status: "loading" });
    this.props.uploadReport(this.state.selectedReportFile, (success) => {
      if (success) {
        this.props.updateBaseState();
        this.setState({ status: "success" });
      } else {
        this.setState({ status: "failure" });
      }
    });
    setTimeout(() => {
      this.setState({ status: "waiting" });
    }, 2000);
  }

  render() {
    // Avatar upload button logic
    const report_uploaded = this.state.selectedReportFile !== null;
    const report_file_label = !report_uploaded
      ? "No file chosen."
      : this.state.selectedReportFile["name"];
    const report_btn_class =
      "btn btn" + (!report_uploaded ? "" : " btn-info btn-fill");

    const report_btn_disabled =
      !report_uploaded ||
      ["success", "loading", "failure"].includes(this.state.status);

    const report_upload_button = (
      <button
        disabled={report_btn_disabled}
        style={{ float: "right" }}
        onClick={this.uploadReport}
        className={report_btn_class}
      >
        {" "}
        <ActionMessage
          default_message="Upload Report"
          status={this.state.status}
        />{" "}
      </button>
    );
    let report_status = null;
    if (this.props.report_uploaded === false) {
      report_status = (
        <label style={{ float: "right" }}>
          {" "}
          You have not uploaded a report.
        </label>
      );
    } else {
      report_status = (
        <label style={{ float: "right" }}>report uploaded!</label>
      );
    }

    return (
      <div className="col-md-12">
        <div className="form-group">
          <label>Report</label>
          {report_status}
          <br />
          <label htmlFor="report_file_upload">
            <div className="btn"> Choose File </div>{" "}
            <span
              style={{
                textTransform: "none",
                marginLeft: "10px",
                fontSize: "14px",
              }}
            >
              {" "}
              {report_file_label}{" "}
            </span>
          </label>
          <input
            id="report_file_upload"
            type="file"
            onChange={this.fileChangeHandler}
            style={{ display: "none" }}
          />
          {report_upload_button}
        </div>
      </div>
    );
  }
}

export default ReportUpload;
