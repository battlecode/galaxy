// Based on https://stackoverflow.com/a/67233977
import React from "react";

const Alert = (props) => {
  const displayStyle = props.alert_message != "" ? "block" : "none";

  function closeAlert(e) {
    e.stopPropagation();
    props.closeAlert();
  }

  return (
    <div
      className="alert alert-danger alert-dismissible"
      role="alert"
      style={{
        position: "fixed",
        bottom: "30px",
        right: "30px",
        "z-index": 9999,
        display: displayStyle,
      }}
    >
      <button
        type="button"
        className="close"
        data-dismiss="alert"
        aria-label="Close"
        onClick={closeAlert}
        style={{ color: "black" }}
      >
        <span aria-hidden="true">&times;</span>
      </button>
      <div className="alert-message">{props.alert_message}</div>
    </div>
  );
};

export default Alert;
