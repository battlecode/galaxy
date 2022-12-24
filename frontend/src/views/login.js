import React, { Component } from "react";
import Api from "../api";

class LoginRegister extends Component {
  state = {
    email: "",
    password: "",
    username: "",
    first: "",
    last: "",
    dob: "",
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
    this.submitLogin();
  };

  submitLogin = () => {
    const { username, password } = this.state;
    Api.login(username, password, this.callback);
  };

  changeHandler = (e) => {
    const { id } = e.target;
    const val = e.target.value;
    this.setState({ [id]: val });
  };

  render() {
    const { error, success, register } = this.state;

    let errorDiv = null;
    if (error) {
      errorDiv = (
        <div
          className="card"
          style={{
            padding: "20px",
            width: Math.min(window.innerWidth, 350),
            margin: "40px auto",
            marginBottom: "0px",
            fontSize: "1.1em",
          }}
        >
          <b>Error: </b>
          {error}
        </div>
      );
    }

    let successDiv = null;
    if (success) {
      successDiv = (
        <div
          className="card"
          style={{
            padding: "20px",
            width: Math.min(window.innerWidth, 350),
            margin: "40px auto",
            marginBottom: "0px",
            fontSize: "1.1em",
          }}
        >
          <b>Success.</b> {success}
        </div>
      );
    }

    let buttons = (
      <button
        type="submit"
        value="submit"
        className="btn btn-primary btn-block btn-fill"
      >
        Log in
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
          Log in below to participate in Battlecode!
        </p>
        {errorDiv}
        {successDiv}
        <form onSubmit={this.formSubmit}>
          <div
            className="card"
            style={{
              width: Math.min(window.innerWidth, 350),
              margin: error ? "20px auto" : "40px auto",
            }}
          >
            <div className="content">
              <div className="row">
                <div className="col-md-12">
                  <div className="form-group">
                    <label>Username</label>
                    <input
                      type="text"
                      id="username"
                      className="form-control"
                      onChange={this.changeHandler}
                    />
                  </div>
                </div>
                <div style={{ display: register ? "block" : "none" }}>
                  <div className="col-xs-6">
                    <div className="form-group">
                      <label>First Name</label>
                      <input
                        type="text"
                        id="first"
                        className="form-control"
                        onChange={this.changeHandler}
                      />
                    </div>
                  </div>
                  <div className="col-xs-6">
                    <div className="form-group">
                      <label>Last Name</label>
                      <input
                        type="text"
                        id="last"
                        className="form-control"
                        onChange={this.changeHandler}
                      />
                    </div>
                  </div>
                  <div className="col-xs-6">
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        id="email"
                        className="form-control"
                        onChange={this.changeHandler}
                      />
                    </div>
                  </div>
                  <div className="col-xs-6">
                    <div className="form-group">
                      <label>Date of Birth</label>
                      <input
                        type="text"
                        id="dob"
                        placeholder="YYYY-MM-DD"
                        className="form-control"
                        onChange={this.changeHandler}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-md-12">
                  <div className="form-group">
                    <label>Password</label>
                    <input
                      type="password"
                      id="password"
                      className="form-control"
                      onChange={this.changeHandler}
                    />
                  </div>
                </div>
              </div>
              {buttons}
              <br />
              <div className="row text-center">
                <div className="col-xs-6">
                  <a
                    href={"/register"}
                  >
                    Register
                  </a>
                </div>
                <div className="col-xs-6 border-right">
                  <a
                    href={"/password_forgot"}
                  >
                    Forgot Password
                  </a>
                </div>
              </div>
              <div className="clearfix" />
            </div>
          </div>
        </form>
      </div>
    );
  }
}

export default LoginRegister;
