import React, { Component } from "react";
import Api from "../api";

class Register extends Component {
  state = {
    email: "",
    password: "",
    username: "",
    first: "",
    last: "",
    dob: "",
    gender: "",

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

  submitLogin = () => {
    const { username, password } = this.state;
    Api.login(username, password, this.callback);
  };

  submitRegister = () => {
    const { username, register, email, first, last, dob, password, gender } =
      this.state;
    // ensure that all fields are correct
    if (username.length < 4)
      this.setState({ error: "Username must be at least 4 characters." });
    else if (email.length < 4)
      this.setState({ error: "Email must be at least 4 characters." });
    else if (username.indexOf(".") > -1)
      this.setState({ error: "Username must not contain dots." });
    else if (!first) this.setState({ error: "Must provide first name." });
    else if (!last) this.setState({ error: "Must provide last name." });
    else if (!dob.match(/^\d{4}-\d{2}-\d{2}$/g))
      this.setState({ error: "Must provide DOB in YYYY-MM-DD form." });
    else if (password.length < 6)
      this.setState({ error: "Password must be at least 6 characters." });
    // TODO validate gender
    else {
      // TODO pass gender in here
      Api.register(email, username, password, first, last, dob, this.callback);
    }
  };

  changeHandler = (e) => {
    const { id } = e.target;
    const val = e.target.value;
    this.setState({ [id]: val });
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
              width: "350px",
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
                <div className="col-md-12">
                  <div className="form-group">
                    <label>Email</label>
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
                <div className="col-xs-6">
                  <div className="form-group">
                    <label>Gender</label>
                    <select
                      className="form-control"
                      id="gender"
                      onChange={this.changeHandler}
                    >
                      <option value=""></option>
                      <option value="An option">An option</option>
                    </select>
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
