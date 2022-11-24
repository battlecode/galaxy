import React, { Component } from "react";
import Floater from "react-floater";

class Gender extends Component {
  genderChangeHandler = (e) => {
    this.props.changeHandler(e);
    this.props.blankGenderDetails();
  };

  render() {
    return (
      <div>
        <div className="col-md-4">
          <div className="form-group">
            <label>Gender Identity *</label>
            <Floater
              content={
                <div>
                  This information is only used in anonymized and aggregated
                  form to track diversity for ourselves and our sponsors.
                </div>
              }
              showCloseButton={true}
            >
              <i className="pe-7s-info pe-fw" />
            </Floater>
            <select
              className="form-control"
              id="profile-gender"
              onChange={this.genderChangeHandler}
              value={this.props.gender}
            >
              <option value=""></option>
              <option value="F">Female </option>
              <option value="M">Male </option>
              <option value="N">Non-binary </option>
              <option value="*">Prefer to self-describe</option>
              <option value="?">Rather not say </option>
            </select>
          </div>
        </div>
        {this.props.gender == "*" && (
          <div className="col-md-8">
            <div className="form-group">
              <label>Self-described Gender Identity</label>
              <input
                type="text"
                id="profile-gender_details"
                className="form-control"
                onChange={this.props.changeHandler}
                value={this.props.gender_details}
              />
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default Gender;
