import React, { Component } from "react";
import Api from "../api";

import Country from "../components/country";
import Gender from "../components/gender";
import { get_user_errors } from "../utils/error_handling";

class Register extends Component {
  state = {
    user: {
      username: "",
      password: "",
      email: "",
      first_name: "",
      last_name: "",
      profile: {
        gender: "",
        gender_details: "",
        school: "",
      },
    },
    register: false,
    errors: [],
    success: "",
  };

  forgotPassword = () => {
    window.location.replace("/forgotPassword");
  };

  callback = (response_json, success) => {
    if (success) {
      window.location.assign("/");
    } else {
      this.setState({
        errors: get_user_errors(response_json),
      });
    }
  };

  formSubmit = (e) => {
    e.preventDefault();
    this.submitRegister();
  };

  submitRegister = () => {
    const user = this.state.user;
    Api.register(this.state.user, this.callback);
  };

  // Similarly structured to the changeHandler in account.js
  changeHandler = (e) => {
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
  };

  blankGenderDetails = () => {
    this.setState(function (prevState, props) {
      prevState.user.profilegender_details = "";
      return prevState;
    });
  };

  render() {
    const { errors, success, register } = this.state;

    const errorReports = errors.map(function (error, i) {
      const [field, error_message] = error;
      return (
        <div key={i}>
          Error in field <b>{field}</b>: {error_message}
        </div>
      );
    });

    const errorsDiv = errors.length > 0 && (
      <div
        className="card"
        style={{
          padding: "20px",
          width: "500px",
          margin: "40px auto",
          marginBottom: "0px",
          fontSize: "1.1em",
        }}
      >
        {errorReports}
      </div>
    );

    const successDiv = success && (
      <div
        className="card"
        style={{
          padding: "20px",
          width: "350px",
          margin: "40px auto",
          marginBottom: "0px",
          fontSize: "1.1em",
        }}
      >
        <b>Success.</b> {success}
      </div>
    );

    let buttons = (
      <button
        type="submit"
        value="submit"
        className="btn btn-primary btn-block btn-fill"
      >
        Register
      </button>
    );

    return (
      <div
        className="content"
        style={{
          height: "100vh",
          width: "100vw",
          position: "absolute",
          top: "0px",
          left: "0px",
        }}
      >
        <div
          className="dustBackground"
          style={{
            height: "100vh",
            width: "100vw",
            position: "fixed",
            top: "0px",
            left: "0px",
            zIndex: "-1",
          }}
        ></div>
        <h1
          style={{
            textAlign: "center",
            fontWeight: "bold",
            color: "white",
          }}
        >
          Battlecode
        </h1>
        <p
          style={{
            textAlign: "center",
            fontWeight: "bold",
            color: "white",
          }}
        >
          {/* Note that this page does not change depending on episode */}
          Register below to participate in Battlecode! For those who are taking
          this class <br />
          for credit, go to the "Account" page and fill in your Kerberos ID
          after registering.
        </p>
        {errorsDiv}
        {successDiv}
        <form onSubmit={this.formSubmit}>
          <div
            className="card"
            style={{
              width: "600px",
              margin: errors.length > 0 ? "20px auto" : "40px auto",
            }}
          >
            <div className="content">
              <div className="row">
                <div className="col-md-12">
                  <div className="form-group">
                    <label>Username *</label>
                    <input
                      type="text"
                      id="username"
                      className="form-control"
                      onChange={this.changeHandler}
                    />
                  </div>
                </div>
                <div className="col-md-12">
                  <div className="form-group">
                    <label>Password *</label>
                    <input
                      type="password"
                      id="password"
                      className="form-control"
                      onChange={this.changeHandler}
                    />
                  </div>
                </div>
                <div className="col-md-12">
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      id="email"
                      className="form-control"
                      onChange={this.changeHandler}
                    />
                  </div>
                  <div className="clearfix"></div>
                </div>
                <div className="col-xs-6">
                  <div className="form-group">
                    <label>First Name *</label>
                    <input
                      type="text"
                      id="first_name"
                      className="form-control"
                      onChange={this.changeHandler}
                    />
                  </div>
                </div>
                <div className="col-xs-6">
                  <div className="form-group">
                    <label>Last Name *</label>
                    <input
                      type="text"
                      id="last_name"
                      className="form-control"
                      onChange={this.changeHandler}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label>School</label>
                    <input
                      type="text"
                      id="profile-school"
                      className="form-control"
                      onChange={this.changeHandler}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <Country onChange={this.changeHandler} />
                </div>
                <Gender
                  changeHandler={this.changeHandler}
                  gender={this.state.user.profile.gender}
                  blankGenderDetails={this.blankGenderDetails}
                />
              </div>
              {buttons}
            </div>
          </div>
        </form>
      </div>
    );
  }
}

export default Register;
