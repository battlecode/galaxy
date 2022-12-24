import React, { Component } from "react";
import Api from "../api";

class PasswordForgot extends Component {
  state = {
    success: false,
    error: false,
    email: "",
  };

  forgotPassword = (e) => {
    e.preventDefault();
    const { state } = this;
    if (state.email) {
      Api.forgotPassword(state.email, this.callback);
    }
  };

  callback = (data, success) => {
    if (success) {
      this.setState({
        success:
          "Email sent! Please wait a few minutes to receive. Don't forget to check your spam folder.",
        error: false,
      });
    } else {
      this.setState({
        error: data,
        success: false,
      });
    }
  };

  changeHandler = (e) => {
    const { value } = e.target;
    this.setState({ email: value });
  };

  render() {
    const { error, success } = this.state;
    return (
      <div
        className="content dustBackground"
        style={{
          height: "100vh",
          width: "100vw",
          position: "absolute",
          top: "0px",
          left: "0px",
        }}
      >
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
          Enter your email below to receive a password reset email. Contact battlecode@mit.edu if you encounter any issues. 
        </p>
        {error && (
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
            <b>Error. </b>
            {error}
          </div>
        )}

        {success && (
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
            <b>Success. </b>
            {success}
          </div>
        )}

        <div
          className="card"
          style={{
            width: Math.min(window.innerWidth, 350),
            margin: error ? "20px auto" : "30px auto",
          }}
        >
          <div className="content">
            <form onSubmit={this.forgotPassword}>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  id="email"
                  className="form-control"
                  onChange={this.changeHandler}
                />
              </div>
              <button
                type="submit"
                value="Submit"
                className="btn btn-secondary btn-block btn-fill"
              >
                Forgot Password
              </button>
              <div className="clearfix" />
            </form>
          </div>
        </div>
      </div>
    );
  }
}

export default PasswordForgot;
