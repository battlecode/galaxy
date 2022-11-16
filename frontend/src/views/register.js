import React, { Component } from "react";
import Api from "../api";
import Floater from "react-floater";

class Register extends Component {
  state = {
    user_profile: {
      user: {
        username: "",
        password: "",
        email: "",
        first_name: "",
        last_name: "",
      },
      gender: "",
      gender_details: "",
      school: "",
    },
    register: false,
    error: "",
    success: "",
  };

  forgotPassword = () => {
    window.location.replace("/forgotPassword");
  };

  callback = (message, success) => {
    if (success) {
      window.location.assign("/");
    } else {
      this.setState({
        error: message,
      });
    }
  };

  formSubmit = (e) => {
    e.preventDefault();
    this.submitRegister();
  };

  submitRegister = () => {
    const user_profile = this.state.user_profile;
    const user = user_profile.user;
    // Validate fields
    if (user.username.length < 4)
      this.setState({ error: "Username must be at least 4 characters." });
    else if (user.email.length < 4)
      this.setState({ error: "Email must be at least 4 characters." });
    else if (user.username.indexOf(".") > -1)
      this.setState({ error: "Username must not contain dots." });
    else if (!user.first_name)
      this.setState({ error: "Must provide first name." });
    else if (!user.last_name)
      this.setState({ error: "Must provide last name." });
    else if (user.password.length < 6)
      this.setState({ error: "Password must be at least 6 characters." });
    else if (user.gender == "") {
      this.setState({
        error: "Must select an option in the Gender Identity dropdown.",
      });
    } else {
      Api.register(this.state.user_profile, this.callback);
    }
  };

  // Similarly structured to the changeHandler in account.js
  changeHandler = (e) => {
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
  };

  render() {
    const { error, success, register } = this.state;

    const errorDiv = error && (
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
        <b>Error. </b>
        {error}
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
          for credit, go to the "Account" page and fill in your kerb after
          registering.
        </p>
        {errorDiv}
        {successDiv}
        <form onSubmit={this.formSubmit}>
          <div
            className="card"
            style={{
              width: "600px",
              margin: error ? "20px auto" : "40px auto",
            }}
          >
            <div className="content">
              <div className="row">
                <div className="col-md-12">
                  <div className="form-group">
                    <label>Username *</label>
                    <input
                      type="text"
                      id="user-username"
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
                      id="user-password"
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
                      id="user-email"
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
                      id="user-first_name"
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
                      id="user-last_name"
                      className="form-control"
                      onChange={this.changeHandler}
                    />
                  </div>
                </div>
                <div className="col-md-12">
                  <div className="form-group">
                    <label>School</label>
                    <input
                      type="text"
                      id="school"
                      className="form-control"
                      onChange={this.changeHandler}
                    />
                  </div>
                </div>
                <div className="col-xs-4">
                  <div className="form-group">
                    <label>Gender Identity *</label>
                    <Floater
                      content={
                        <div>
                          This information helps us track diversity progress for
                          ourselves and our sponsors!
                        </div>
                      }
                      showCloseButton={true}
                    >
                      <i className="pe-7s-info pe-fw" />
                    </Floater>
                    <select
                      className="form-control"
                      id="gender"
                      onChange={this.changeHandler}
                    >
                      <option value=""></option>
                      <option value="F">Female </option>
                      <option value="M">Male </option>
                      <option value="N">Non-binary </option>
                      <option value="*">
                        Prefer to self-describe (use space to the right)
                      </option>
                      <option value="?">Rather not say </option>
                    </select>
                  </div>
                </div>
                <div className="col-xs-8">
                  <div className="form-group">
                    <label>Self-described Gender Identity</label>
                    <input
                      type="text"
                      id="gender_details"
                      className="form-control"
                      onChange={this.changeHandler}
                    />
                  </div>
                </div>
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
