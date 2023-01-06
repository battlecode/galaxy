import React, { Component } from "react";
import Api from "../api";
import { print_errors } from "../utils/error_handling";

class PasswordChange extends Component {
  state = {
    password: "",
    passwordVerify: "",
    success: false,
    error: false,
    loading: false,
  };

  changePassword = (e) => {
    const { state } = this;
    e.preventDefault();

    if (!state.password) {
      this.setState({ error: "Please enter a password" });
    }

    if (state.password !== state.passwordVerify) {
      this.setState({ error: "Passwords do not match. " });
      return;
    }

    let token =
      this.props.location.search && this.props.location.search.split("=");
    token = token.length > 1 && token[1];

    this.setState({ loading: true });
    Api.doResetPassword(state.password, token, this.onApiReturn);
  };

  changeHandler = (e) => {
    const { id } = e.target;
    const val = e.target.value;
    this.setState({ [id]: val });
  };

  onApiReturn = (response, success) => {
    if (success) {
      this.setState({ success: true, loading: false });
      const redirect = () => {
        this.props.history.push("/login");
      };
      setTimeout(redirect.bind(this), 3000);
    } else {
      let error_msg = print_errors(response);
      if (response.responseJSON && response.responseJSON.detail) {
        error_msg +=
          "\nThis is most likely because your password reset link has expired. Try resetting your password again.";
      }
      this.setState({ error: error_msg, loading: false });
    }
  };

  render() {
    const { error, success, loading } = this.state;
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
        {loading && (
          <div
            style={{
              textAlign: "center",
              fontWeight: "bold",
              color: "white",
              marginTop: "50px",
            }}
          >
            <b>Loading . . . </b>
          </div>
        )}

        {error && (
          <div
            className="card error-message"
            style={{
              padding: "20px",
              width: Math.min(window.innerWidth, 350),
              margin: "40px auto",
              marginBottom: "0px",
              fontSize: "1.1em",
            }}
          >
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
            <b>Success. Redirecting to login in a few seconds...</b>
          </div>
        )}

        <div
          className="card"
          style={{
            width: Math.min(window.innerWidth, 350),
            margin: error ? "20px auto" : "100px auto",
          }}
        >
          <div className="content">
            <form onSubmit={this.changePassword}>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  id="password"
                  className="form-control"
                  onChange={this.changeHandler}
                />
                <label>Confirm Password</label>
                <input
                  type="password"
                  id="passwordVerify"
                  className="form-control"
                  onChange={this.changeHandler}
                />
              </div>
              <button
                type="submit"
                value="Submit"
                className="btn btn-secondary btn-block btn-fill"
              >
                Reset Your Password
              </button>
              <div className="clearfix" />
            </form>
          </div>
        </div>
      </div>
    );
  }
}

export default PasswordChange;
