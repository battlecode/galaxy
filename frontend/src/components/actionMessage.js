import React, { Component } from "react";

class ActionMessage extends Component {
  render() {
    switch (this.props.status) {
      case "waiting":
        return this.props.default_message;
      case "loading":
        return <i className="fa fa-circle-o-notch fa-spin"></i>;
      case "success":
        return <i className="fa fa-check"></i>;
      case "failure":
        return <i className="fa fa-times"></i>;
    }
  }
}

export default ActionMessage;
