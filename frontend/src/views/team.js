import React, { Component } from "react";
import Api from "../api";

import TeamCard from "../components/teamCard";
import Alert from "../components/alert";
import MultiEpisode from "./multi-episode";
import Floater from "react-floater";
import { get_team_errors } from "../utils/error_handling";

class YesTeam extends Component {
  constructor(props) {
    super(props);

    // Copy the user's fetched team profile for use in editable form state.
    const copied_team = { ...props.team };
    copied_team.profile = props.team ? { ...props.team.profile } : {};

    this.state = {
      team: copied_team,
      up: "Update Info",
      errors: [],
    };

    this.changeHandler = this.changeHandler.bind(this);
    this.updateTeam = this.updateTeam.bind(this);
    this.uploadProfile = this.uploadProfile.bind(this);
  }

  leaveTeam = () => {
    Api.leaveTeam(this.props.episode, (success) => {
      this.props.updateBaseState();
    });
  };

  changeHandler(e) {
    var id = e.target.id;
    var val = e.target.type === "checkbox" ? e.target.checked : e.target.value;

    // TODO: handle changes to eligiblity options
    // if (id === "international") val = !val;

    if (id.startsWith("profile")) {
      this.setState(function (prevState, props) {
        var team_field = id.split("-")[1];
        prevState.team.profile[team_field] = val;
        return prevState;
      });
    } else {
      this.setState(function (prevState, props) {
        prevState.team[id] = val;
        return prevState;
      });
    }
  }

  updateTeam() {
    this.setState({ up: '<i class="fa fa-circle-o-notch fa-spin"></i>' });
    Api.updateTeam(
      this.state.team,
      this.props.episode,
      function (response_json, success) {
        if (success) {
          this.setState({ up: '<i class="fa fa-check"></i>' });
          this.props.updateBaseState();
        } else {
          this.setState({ up: '<i class="fa fa-times"></i>' });
          this.setState({ errors: get_team_errors(response_json) });
        }
        setTimeout(
          function () {
            this.setState({ up: "Update Info" });
          }.bind(this),
          2000
        );
      }.bind(this)
    );
  }

  uploadProfile(e) {
    var reader = new FileReader();
    reader.onloadend = () =>
      this.setState(function (prevState, props) {
        prevState.team.bio = reader.result;
        return prevState;
      });
    reader.readAsDataURL(e.target.files[0]);
  }

  render() {
    // Error reporting
    const errors = this.state.errors;
    let alert_message;
    if (errors.length > 0) {
      const [first_field, first_error] = errors[0];
      alert_message = `Error in field ${first_field}: ${first_error}`;
    } else {
      alert_message = "";
    }
    return (
      <div>
        <Alert alert_message={alert_message} closeAlert={this.closeAlert} />
        <div className="col-md-8">
          <div className="card">
            <div className="header">
              <h4 className="title">Tournament Eligibility</h4>
            </div>
            <div className="content">
              {/* <ResumeStatus team={this.state.team} /> */}
              <p>
                We need to know a little about your team in order to determine
                which prizes your team is eligible for. Check all boxes that
                apply to all members your team.
              </p>
              {/*<EligibilityOptions
                change={this.changeHandler}
                team={this.state.team}
                update={this.updateTeam}
                up_but={this.state.up}
                episode={this.props.episode}
                /> TODO: eligibility options*/}
            </div>
          </div>

          <div className="card">
            <div className="header">
              <h4 className="title">Team</h4>
            </div>
            <div className="content">
              <div className="row">
                <div className="col-md-7">
                  <div className="form-group">
                    <label>Team Name</label>
                    <input
                      type="text"
                      id="name"
                      className="form-control"
                      value={this.state.team.name}
                      disabled
                    />
                  </div>
                </div>
                <div className="col-md-5">
                  <div className="form-group">
                    <label>Join Key (static)</label>
                    <input
                      type="text"
                      className="form-control"
                      onChange={() => null}
                      value={this.state.team.join_key}
                    />
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6">
                  <label className="center-row">
                    <input
                      type="checkbox"
                      id="profile-auto_accept_ranked"
                      checked={this.state.team.profile.auto_accept_ranked}
                      onChange={this.changeHandler}
                      className="form-control center-row-start"
                    />{" "}
                    Auto-accept ranked scrimmages.
                  </label>
                </div>
                <div className="col-md-6">
                  <label className="center-row">
                    <input
                      type="checkbox"
                      id="profile-auto_accept_unranked"
                      checked={this.state.team.profile.auto_accept_unranked}
                      onChange={this.changeHandler}
                      className="form-control center-row-start"
                    />{" "}
                    Auto-accept unranked scrimmages.
                  </label>
                </div>
              </div>
              <div className="row">
                <div className="col-md-12">
                  {/* <div className="form-group">
                    <label>Team Avatar URL</label>
                    <input
                      type="text"
                      id="avatar"
                      className="form-control"
                      onChange={this.changeHandler}
                      value={this.state.team.avatar}
                    />
                  </div> */}
                </div>
              </div>
              <div className="row">
                <div className="col-md-12">
                  <div className="form-group">
                    <label>Team Quote</label>
                    <input
                      type="text"
                      id="profile-quote"
                      className="form-control"
                      onChange={this.changeHandler}
                      value={this.state.team.profile.quote}
                    />
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-12">
                  <div className="form-group">
                    <label>Team Bio</label>
                    <textarea
                      id="profile-biography"
                      rows={5}
                      className="form-control"
                      placeholder="Put your team bio here."
                      onChange={this.changeHandler}
                      value={this.state.team.profile.biography}
                    />
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={this.updateTeam}
                className="btn btn-info btn-fill pull-right"
                dangerouslySetInnerHTML={{ __html: this.state.up }}
              ></button>
              <button
                type="button"
                onClick={this.leaveTeam}
                style={{ marginRight: "10px" }}
                className="btn btn-danger btn-fill pull-right"
              >
                Leave Team
              </button>
              <div className="clearfix" />
            </div>
          </div>
        </div>
        <div className="col-md-4">{<TeamCard team={this.state.team} />}</div>
      </div>
    );
  }
}

class NoTeam extends Component {
  constructor() {
    super();
    this.state = {
      team_name: "",
      join_key: "",
      team_join_name: "",
      alert_message: "",
    };

    this.joinTeam = this.joinTeam.bind(this);
    this.createTeam = this.createTeam.bind(this);
    this.changeHandler = this.changeHandler.bind(this);
  }

  changeHandler(e) {
    var id = e.target.id;
    var val = e.target.value;
    this.setState(function (prevState, props) {
      prevState[id] = val;
      return prevState;
    });
  }

  joinTeam() {
    Api.joinTeam(
      this.state.join_key,
      this.state.team_join_name,
      this.props.episode,
      this.joinCallback
    );
  }

  joinCallback = (success) => {
    if (success) this.props.updateBaseState();
    else
      this.setState({
        alert_message:
          "Sorry, that team name and join key combination is not valid.",
      });
  };

  createTeam() {
    Api.createTeam(
      this.state.team_name,
      this.props.episode,
      this.createTeamCallback
    );
  }

  createTeamCallback = (success) => {
    if (success) this.props.updateBaseState();
    else
      this.setState({
        alert_message: "Sorry, this team name is already being used.",
      });
  };

  closeAlert = () => {
    this.setState({ alert_message: "" });
  };

  render() {
    return (
      <div className="col-md-12">
        <Alert
          alert_message={this.state.alert_message}
          closeAlert={this.closeAlert}
        />
        <div className="card">
          <div className="header">
            <h4 className="title">Create a Team</h4>
          </div>
          <div className="content">
            <div className="row">
              <div className="col-md-12">
                <div className="form-group">
                  <label>Team Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="team_name"
                    onChange={this.changeHandler}
                  />
                </div>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-info btn-fill pull-right"
              onClick={this.createTeam}
            >
              Create
            </button>
            <div className="clearfix" />
          </div>
        </div>

        <div className="card">
          <div className="header">
            <h4 className="title">Join a Team</h4>
          </div>
          <div className="content">
            <div className="row">
              <div className="col-md-8">
                <div className="form-group">
                  <label>Team Join Key</label>
                  <input
                    type="text"
                    className="form-control"
                    id="join_key"
                    onChange={this.changeHandler}
                  />
                </div>
              </div>
              <div className="col-md-4">
                <div className="form-group">
                  <label>Team Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="team_join_name"
                    onChange={this.changeHandler}
                  />
                </div>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-info btn-fill pull-right"
              onClick={this.joinTeam}
            >
              Join
            </button>
            <div className="clearfix" />
          </div>
        </div>
      </div>
    );
  }
}

// pass team in props.team
class ResumeStatus extends Component {
  render() {
    var resumestring;

    var unverified_users = this.props.team.users.filter(
      (el) => !this.props.team.verified_users.includes(el)
    );

    if (
      this.props.team.verified_users.length === this.props.team.users.length
    ) {
      resumestring = (
        <div>
          <p style={{ color: "green" }}>
            Everyone on your team has uploaded a resume!
          </p>
        </div>
      );
    } else {
      resumestring = (
        <div>
          <p style={{ color: "red", fontWeight: "bold" }}>
            Not everyone on your team has uploaded a resume, so you are
            currently not eligible for the qualifying or final tournaments.
            Users who have not yet uploaded a resume:{" "}
            {unverified_users.join(", ")}
          </p>
        </div>
      );
    }

    return resumestring;
  }
}

// pass change handler in props.change and team in props.team
// NOTE: If you are ever working with teams' eligility (for example, to pull teams for the newbie tournament), please see backend/docs/ELIGIBILITY.md before you do anything! The variable names here are poorly named (because columns in the database are poorly named).
class EligibilityOptions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      extension: MultiEpisode.getExtension(props.episode),
    };
  }

  render() {
    return (
      <div className="row" style={{ marginTop: "1em" }}>
        <div className="col-md-12">
          <div className="form-group" style={{ display: "flex" }}>
            <label>Full-time Students</label>
            <Floater
              content={
                <div>
                  <p>
                    Teams must consist entirely of active high-school and/or
                    college students to be eligible for prizes. If you are
                    unsure about whether you are an active student, read more
                    about eligibilty under{" "}
                    <a href={`/${this.props.episode}/tournaments`}>
                      tournaments
                    </a>{" "}
                    or reach out to one of Teh Devs on Discord or over email.
                  </p>
                </div>
              }
              showCloseButton={true}
            >
              <i className="pe-7s-info pe-fw" />
            </Floater>
            <input
              type="checkbox"
              className="form-control"
              onChange={this.props.change}
              style={{ width: "20px", height: "20px", margin: "0 0 0 10px" }}
              id="student"
              checked={this.props.team.student}
            />
          </div>
          <div className="form-group" style={{ display: "flex" }}>
            <label>US Students</label>
            <Floater
              content={
                <div>
                  <p>
                    Teams consisting entirely of US students compete in the US
                    Qualifying Tournament. If a team has at least one non-US
                    competitor, it will compete in the International Qualifying
                    Tournament. A US student is a student who attends a school
                    in the United States.
                  </p>
                </div>
              }
              showCloseButton={true}
            >
              <i className="pe-7s-info pe-fw" />
            </Floater>
            <input
              type="checkbox"
              className="form-control"
              onChange={this.props.change}
              style={{ width: "20px", height: "20px", margin: "0 0 0 10px" }}
              id="international"
              checked={!this.props.team.international}
            />
          </div>
          <div className="form-group" style={{ display: "flex" }}>
            <label>Newbie</label>
            <Floater
              content={
                <div>
                  <p>
                    Teams consisting entirely of MIT students who have never
                    competed in Battlecode before are eligible for the Newbie
                    Tournament.
                  </p>
                </div>
              }
              showCloseButton={true}
            >
              <i className="pe-7s-info pe-fw" />
            </Floater>
            <input
              type="checkbox"
              className="form-control"
              onChange={this.props.change}
              style={{ width: "20px", height: "20px", margin: "0 0 0 10px" }}
              id="mit"
              checked={this.props.team.mit}
            />
          </div>
          <div className="form-group" style={{ display: "flex" }}>
            <label>High School Students</label>
            <Floater
              content={
                <div>
                  <p>
                    Teams of only high school (and earlier) students are
                    eligible for the High School Tournament, regardless of
                    whether you are all US students or not.
                  </p>
                </div>
              }
              showCloseButton={true}
            >
              <i className="pe-7s-info pe-fw" />
            </Floater>
            <input
              type="checkbox"
              className="form-control"
              onChange={this.props.change}
              style={{ width: "20px", height: "20px", margin: "0 0 0 10px" }}
              id="high_school"
              checked={this.props.team.high_school}
            />
          </div>
          <button
            type="button"
            onClick={this.props.update}
            className="btn btn-info btn-fill pull-right"
            dangerouslySetInnerHTML={{ __html: this.props.up_but }}
          ></button>
        </div>
      </div>
    );
  }
}

class Team extends Component {
  render() {
    return (
      <div className="content">
        <div className="content">
          <div className="container-fluid">
            <div className="row">
              {!this.props.team && (
                <NoTeam
                  episode={this.props.episode}
                  updateBaseState={this.props.updateBaseState}
                />
              )}
              {this.props.team && (
                <YesTeam
                  team={this.props.team}
                  episode={this.props.episode}
                  updateBaseState={this.props.updateBaseState}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
export default Team;
