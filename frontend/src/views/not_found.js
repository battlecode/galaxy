import React, { Component } from "react";

class NotFound extends Component {
  constructor(props) {
    super();
    this.state = {
      pageError: "✖️",
    };
  }

  render() {
    const pageErrorStyle = {
      paddingBottom: "0",
      fontSize: "100px",
      marginBottom: "-30px",
    };

    return (
      <div className="content">
        <p className="text-center" style={pageErrorStyle}>
          {" "}
          {this.state.pageError}{" "}
        </p>
        <h1 className="text-center">404 error</h1>
        <h5 className="text-center">
          Sorry, we couldn't find the page you were looking for!
        </h5>
      </div>
    );
  }
}

export default NotFound;
