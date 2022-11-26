import React, { Component } from "react";
import Api from "../api";

import UserCard from "../components/userCard";
import Country from "../components/country";
import Gender from "../components/gender";
import AvatarUpload from "../components/avatarUpload";
import Alert from "../components/alert";
import Floater from "react-floater";
import { get_user_errors } from "../utils/error_handling";

class Account extends Component {
  constructor(props) {
    super(props);

    // Copy the fetched user profile for use in editable form state.
    const copied_user = { ...props.user };
    copied_user.profile = props.user ? { ...props.user.profile } : {};

    this.state = {
      user: copied_user,
      up: "Update Info",
      selectedResumeFile: null,
      errors: [],
    };

    this.changeHandler = this.changeHandler.bind(this);
    this.updateUser = this.updateUser.bind(this);
    this.uploadProfile = this.uploadProfile.bind(this);
  }

  changeHandler(e) {
    const id = e.target.id;
    const val = e.target.value;
    if (id.startsWith("profile")) {
      this.setState(function (prevState, props) {
        var user_field = id.split("-")[1];
        prevState.user.profile[user_field] = val;
        return prevState;
      });
    } else {
      this.setState(function (prevState, props) {
        prevState.user[id] = val;
        return prevState;
      });
    }
  }

  blankGenderDetails = () => {
    this.setState(function (prevState, props) {
      prevState.user.profile.gender_details = "";
      return prevState;
    });
  };

  fileChangeHandler = (event) => {
    const id = event.target.id;
    if (id == "resume_file_upload") {
      this.setState({
        selectedResumeFile: event.target.files[0],
        loaded: 0,
      });
    } else if (id == "avatar_file_upload") {
      // this.setState({
      //   selectedAvatarFile: event.target.files[0],
      //   loaded: 0,
      // });
    }
  };

  updateUser() {
    this.setState({ up: '<i class="fa fa-circle-o-notch fa-spin"></i>' });
    Api.updateUser(
      this.state.user,
      function (response_json, success) {
        if (success) {
          this.setState({ up: '<i class="fa fa-check"></i>' });
          this.props.updateBaseState();
        } else {
          this.setState({ up: '<i class="fa fa-times"></i>' });
          this.setState({ errors: get_user_errors(response_json) });
        }
        setTimeout(
          function () {
            this.setState({ up: "Update Info" });
          }.bind(this),
          2000
        );
      }.bind(this)
    );
  }

  uploadProfile(e) {
    var reader = new FileReader();
    // TODO: avatar stuff
    // reader.onloadend = () =>
    //   this.setState(function (prevState, props) {
    //     prevState.user.avatar = reader.result;
    //     return prevState;
    //   });
    // reader.readAsDataURL(e.target.files[0]);
  }

  uploadResume = () => {
    Api.resumeUpload(this.state.selectedResumeFile, () =>
      this.props.updateBaseState()
    );
  };

  uploadAvatar = (selected_file) => {
    Api.avatarUpload(selected_file, () => this.props.updateBaseState());
  };

  retrieveResume = () => {
    Api.resumeRetrieve(() => null);
  };

  closeAlert = () => {
    this.setState({ errors: [] });
  };

  render() {
    // Resume upload button logic
    const resume_uploaded = this.state.selectedResumeFile !== null;
    const resume_file_label = !resume_uploaded
      ? "No file chosen."
      : this.state.selectedResumeFile["name"];
    const resume_btn_class =
      "btn btn" + (!resume_uploaded ? "" : " btn-info btn-fill");
    const resume_upload_button = (
      <button
        disabled={!resume_uploaded}
        style={{ float: "right" }}
        onClick={this.uploadResume}
        className={resume_btn_class}
      >
        {" "}
        Upload Resume{" "}
      </button>
    );

    let resume_status = null;
    if (this.state.user.profile.has_resume === false) {
      resume_status = (
        <label style={{ float: "right" }}>
          {" "}
          You have not uploaded a resume.
        </label>
      );
    } else {
      resume_status = (
        <label style={{ float: "right" }}>
          {/* <i
            className="pe-7s-check pe-fw"
            style={{ fontWeight: "bold", color: "green" }}
          /> */}
          Resume uploaded!
          {/* <a onClick={this.retrieveResume}>Download.</a>
          <Floater
            content={
              <div>
                <p>
                  It may take a few minutes for your resume to be processed and
                  available for download.
                </p>
              </div>
            }
            showCloseButton={true}
          >
            <i className="pe-7s-info pe-fw" />
          </Floater>*/}
        </label>
      );
    }

    // Error reporting
    const errors = this.state.errors;
    let alert_message;
    if (errors.length > 0) {
      const [first_field, first_error] = errors[0];
      alert_message = `Error in field ${first_field}: ${first_error}`;
    } else {
      alert_message = "";
    }

    return (
      <div className="content">
        <Alert alert_message={alert_message} closeAlert={this.closeAlert} />
        <div className="content">
          <div className="container-fluid">
            <div className="row">
              <div className="col-md-8">
                <div className="card">
                  <div className="header">
                    <h4 className="title">Edit Profile</h4>
                  </div>
                  <div className="content">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group">
                          <label>Username</label>
                          <input
                            type="text"
                            className="form-control"
                            id="username"
                            value={this.state.user.username}
                            disabled
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label>Email</label>
                          <input
                            type="email"
                            className="form-control"
                            id="email"
                            onChange={this.changeHandler}
                            value={this.state.user.email}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group">
                          <label>First Name</label>
                          <input
                            type="text"
                            className="form-control"
                            id="first_name"
                            onChange={this.changeHandler}
                            value={this.state.user.first_name}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label>Last Name</label>
                          <input
                            type="text"
                            className="form-control"
                            id="last_name"
                            onChange={this.changeHandler}
                            value={this.state.user.last_name}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group">
                          <label>School</label>
                          <input
                            type="text"
                            id="profile-school"
                            className="form-control"
                            onChange={this.changeHandler}
                            value={this.state.user.profile.school}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <Country
                          value={this.state.user.profile.country}
                          onChange={this.changeHandler}
                        />
                      </div>
                      <Gender
                        changeHandler={this.changeHandler}
                        gender={this.state.user.profile.gender}
                        gender_details={this.state.user.profile.gender_details}
                        blankGenderDetails={this.blankGenderDetails}
                      />
                      {/* <div className="row">
                      <div className="col-md-12">
                        <div className="form-group">
                          <label>User Avatar URL</label>
                          <input
                            type="text"
                            id="avatar"
                            className="form-control"
                            onChange={this.changeHandler}
                            value="TODO: avatar" //{this.state.user.avatar}
                          />
                        </div>
                      </div>
                    </div> */}
                      <div className="col-md-12">
                        <div className="form-group">
                          <label>User Bio</label>
                          <textarea
                            rows={5}
                            className="form-control"
                            placeholder="Put your bio here."
                            onChange={this.changeHandler}
                            id="profile-biography"
                            value={this.state.user.profile.biography}
                          />
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={this.updateUser}
                      className="btn btn-info btn-fill pull-right"
                      dangerouslySetInnerHTML={{ __html: this.state.up }}
                    ></button>
                    <div className="clearfix" />
                    <div className="row">
                      <AvatarUpload uploadAvatar={this.uploadAvatar} />
                    </div>
                    <div className="row">
                      <div className="col-md-12">
                        <div className="form-group">
                          <label>Resume</label>
                          <Floater
                            content={
                              <div>
                                <p>
                                  We'll share your resume with our{" "}
                                  <a href="http://battlecode.org/#sponsors-sponsors">
                                    sponsors
                                  </a>
                                  . In the past, sponsors have offered our
                                  competitors opprotunities based of their
                                  resumes and performance in Battlecode!
                                </p>
                              </div>
                            }
                            showCloseButton={true}
                          >
                            <i className="pe-7s-info pe-fw" />
                          </Floater>
                          {resume_status}
                          <br />
                          <label htmlFor="resume_file_upload">
                            <div className="btn"> Choose File </div>{" "}
                            <span
                              style={{
                                textTransform: "none",
                                marginLeft: "10px",
                                fontSize: "14px",
                              }}
                            >
                              {" "}
                              {resume_file_label}{" "}
                            </span>
                          </label>
                          <input
                            id="resume_file_upload"
                            type="file"
                            accept=".pdf"
                            onChange={this.fileChangeHandler}
                            style={{ display: "none" }}
                          />
                          {resume_upload_button}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <UserCard user={this.state.user} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Account;
