import React, { Component } from "react";
import Api from "../api";

class LogOut extends Component {
  render() {
      Api.logout(function () {
        window.location.replace("/");
      });
    }
  }


export default LogOut;
