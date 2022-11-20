import React, { Component } from "react";
import Api from "../api";

class LogOut extends Component {
  render() {
    Api.logout();
  }
}

export default LogOut;
