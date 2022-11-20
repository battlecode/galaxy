import React, { Component } from "react";
import Api from "../api";

import UserCard from "../components/userCard";
import Country from "../components/country";
import Floater from "react-floater";

class Account extends Component {
  constructor(props) {
    super(props);

    // Copy the fetched user profile for use in editable form state.
    const copied_user_profile = { ...props.user_profile };
    copied_user_profile.user = props.user_profile
      ? { ...props.user_profile.user }
      : {};

    this.state = {
      user_profile: copied_user_profile,
      up: "Update Info",
      selectedResumeFile: null,
      selectedAvatarFile: null,
    };

    this.changeHandler = this.changeHandler.bind(this);
    this.updateUser = this.updateUser.bind(this);
    this.uploadProfile = this.uploadProfile.bind(this);
  }

  changeHandler(e) {
    const id = e.target.id;
    const val = e.target.value;
    if (id.startsWith("user")) {
      this.setState(function (prevState, props) {
        var user_field = id.split("-")[1];
        prevState.user_profile.user[user_field] = val;
        return prevState;
      });
    } else {
      this.setState(function (prevState, props) {
        prevState.user_profile[id] = val;
        return prevState;
      });
    }
  }

  fileChangeHandler = (event) => {
    const id = event.target.id;
    if (id == "resume_file_upload") {
      this.setState({
        selectedResumeFile: event.target.files[0],
        loaded: 0,
      });
    } else if (id == "avatar_file_upload") {
      this.setState({
        selectedAvatarFile: event.target.files[0],
        loaded: 0,
      });
    }
  };

  updateUser() {
    this.setState({ up: '<i class="fa fa-circle-o-notch fa-spin"></i>' });
    Api.updateUser(
      this.state.user_profile,
      function (response) {
        if (response) this.setState({ up: '<i class="fa fa-check"></i>' });
        else this.setState({ up: '<i class="fa fa-times"></i>' });
        this.props.updateBaseState();
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

  uploadAvatar = () => {
    Api.avatarUpload(this.state.selectedAvatarFile, () =>
      this.props.updateBaseState()
    );
  };

  retrieveResume = () => {
    Api.resumeRetrieve(() => null);
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
    if (this.state.user_profile.has_resume === false) {
      resume_status = (
        <label style={{ float: "right" }}>
          {" "}
          You have not uploaded a resume.
        </label>
      );
    } else {
      resume_status = (
        <label style={{ float: "right", color: "green" }}>
          <i className="pe-7s-check pe-fw" style={{ fontWeight: "bold" }} />
          <a onClick={this.retrieveResume}>Uploaded!</a>
        </label>
      );
    }

    // Avatar upload button logic
    const avatar_uploaded = this.state.selectedAvatarFile !== null;
    const avatar_file_label = !avatar_uploaded
      ? "No file chosen."
      : this.state.selectedAvatarFile["name"];
    const avatar_btn_class =
      "btn btn" + (!avatar_uploaded ? "" : " btn-info btn-fill");
    const avatar_upload_button = (
      <button
        disabled={!avatar_uploaded}
        style={{ float: "right" }}
        onClick={this.uploadAvatar}
        className={avatar_btn_class}
      >
        {" "}
        Upload Avatar{" "}
      </button>
    );

    return (
      <div className="content">
        <div className="content">
          <div className="container-fluid">
            <div className="row">
              <div className="col-md-8">
                <div className="card">
                  <div className="header">
                    <h4 className="title">Edit Profile</h4>
                  </div>
                  <div className="content">
                    <h5>
                      Make sure to press the "Update Info" button, and wait for
                      confirmation!
                    </h5>
                    <h5>
                      Your info here is <u>used for all episodes</u> and{" "}
                      <u>changed for all episodes!</u>
                    </h5>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group">
                          <label>Username</label>
                          <input
                            type="text"
                            className="form-control"
                            id="user-username"
                            onChange={this.changeHandler}
                            value={this.state.user_profile.user.username}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label>Email</label>
                          <input
                            type="email"
                            className="form-control"
                            id="user-email"
                            onChange={this.changeHandler}
                            value={this.state.user_profile.user.email}
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
                            id="user-first_name"
                            onChange={this.changeHandler}
                            value={this.state.user_profile.user.first_name}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label>Last Name</label>
                          <input
                            type="text"
                            className="form-control"
                            id="user-last_name"
                            onChange={this.changeHandler}
                            value={this.state.user_profile.user.last_name}
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
                            id="school"
                            className="form-control"
                            onChange={this.changeHandler}
                            value={this.state.user_profile.school}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <Country
                          value={this.state.user_profile.country}
                          onChange={this.changeHandler}
                        />
                      </div>
                    </div>
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
                    <div className="row">
                      <div className="col-md-12">
                        <div className="form-group">
                          <label>User Bio</label>
                          <textarea
                            rows={5}
                            className="form-control"
                            placeholder="Put your bio here."
                            onChange={this.changeHandler}
                            id="biography"
                            value={this.state.user_profile.biography}
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
                      <div className="col-md-12">
                        <div className="form-group">
                          <label>Avatar</label>
                          <br />
                          <label htmlFor="avatar_file_upload">
                            <div className="btn"> Choose File </div>{" "}
                            <span
                              style={{
                                textTransform: "none",
                                marginLeft: "10px",
                                fontSize: "14px",
                              }}
                            >
                              {" "}
                              {avatar_file_label}{" "}
                            </span>
                          </label>
                          <input
                            id="avatar_file_upload"
                            type="file"
                            onChange={this.fileChangeHandler}
                            style={{ display: "none" }}
                          />
                          {avatar_upload_button}
                        </div>
                      </div>
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
                <UserCard user_profile={this.state.user_profile} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Account;
