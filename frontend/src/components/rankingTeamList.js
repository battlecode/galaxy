import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import Api from "../api";

import PaginationControl from "./paginationControl";
import Spinner from "./spinner";
import ScrimmageRequestForm from "./scrimmageRequestForm";
import { trimUsername } from "../utils/misc";

class RankingTeamList extends Component {
  state = {
    pendingRequests: {},
    successfulRequests: {},
    requestMenuTeam: null,
    showTeamID: null,
  };

  openRequestForm = (team) => {
    this.setState({ requestMenuTeam: team });
  };

  closeRequestForm = (teamID) => {
    this.setState({ requestMenuTeam: null });
  };

  onTeamRequest = (teamID, extra_info) => {
    const { state } = this;
    if (state.pendingRequests[teamID]) {
      return;
    }

    this.setState((prevState) => {
      return {
        pendingRequests: {
          ...prevState.pendingRequests,
          [teamID]: true,
        },
      };
    });
    Api.requestScrimmage(this.props.episode, teamID, (success) =>
      this.onRequestFinish(teamID, success)
    );
  };

  onRequestFinish = (teamID, success) => {
    this.setState((prevState) => {
      return {
        pendingRequests: {
          ...prevState.pendingRequests,
          [teamID]: false,
        },
        successfulRequests: success && {
          ...prevState.successfulRequests,
          [teamID]: true,
        },
      };
    });
    if (success) {
      this.props.onRequestSuccess();
      setTimeout(() => this.successTimeoutRevert(teamID), SUCCESS_TIMEOUT);
    }
  };

  successTimeoutRevert = (teamID) => {
    this.setState((prevState) => {
      return {
        successfulRequests: {
          ...prevState.successfulRequests,
          [teamID]: false,
        },
      };
    });
  };

  render() {
    const { props, state } = this;

    if (!this.props.loading && props.teams.length === 0) {
      return (
        <div className="card">
          <div className="header">
            <h4 className="title">No Teams Found!</h4>
            <br />
          </div>
        </div>
      );
    } else {
      const teamRows = props.teams.map((team) => {
        let buttonContent = "Request";
        if (state.pendingRequests[team.id]) {
          buttonContent = <i className="fa fa-circle-o-notch fa-spin"></i>;
        } else if (state.successfulRequests[team.id]) {
          buttonContent = <i className="fa fa-check"></i>;
        }
        return (
          <tr key={team.id} className="page-item">
            <td>{Math.round(team.profile.rating)}</td>
            <td>
              <NavLink to={`/${this.props.episode}/rankings/${team.id}`}>
                {team.name}
              </NavLink>
            </td>
            <td>
              {team.members.map((member) => (
                <span>
                  <NavLink to={`/${this.props.episode}/user/${member.id}`}>
                    {trimUsername(member.username, 13)}
                  </NavLink>
                  {team.members.findIndex((m) => m.id === member.id) + 1 !==
                    team.members.length && ","}
                </span>
              ))}
            </td>
            {!this.props.canRequest && <td>{team.profile.quote}</td>}
            {!this.props.canRequest && (
              <td>
                {this.props.episode_info.eligibility_criteria.map(
                  (criterion) => {
                    const eligible = team.profile.eligible_for.includes(
                      criterion.id
                    );
                    return (
                      <span key={criterion.id}>
                        {eligible ? criterion.icon : ""}
                      </span>
                    );
                  }
                )}
              </td>
            )}
            <td>{team.profile.auto_accept_ranked ? "Yes" : "No"}</td>
            <td>{team.profile.auto_accept_unranked ? "Yes" : "No"}</td>
            {this.props.canRequest && (
              <td>
                {this.props.team &&
                  team.id !== this.props.team.id &&
                  team.has_active_submission && (
                    <button
                      className="btn btn-xs"
                      onClick={(event) => {
                        event.stopPropagation();
                        this.openRequestForm(team);
                      }}
                      disabled={this.props.episode_info.frozen}
                    >
                      {buttonContent}
                    </button>
                  )}{" "}
              </td>
            )}
          </tr>
        );
      });

      return (
        <div>
          <ScrimmageRequestForm
            closeRequestForm={this.closeRequestForm}
            team={this.state.requestMenuTeam}
            episode={this.props.episode}
          />
          <div className="card">
            <div className="header">
              <h4 className="title">{this.props.title}</h4>
            </div>
            {this.props.canRequest && this.props.episode_info.frozen && (
              <div className="content">
                Scrimmages may not be requested, due to a submission freeze for
                a tournament. (If you think the freeze has passed, try
                refreshing the page.)
              </div>
            )}
            <div className="content table-responsive table-full-width">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Rating</th>
                    <th>Team</th>
                    <th>Members</th>
                    {!this.props.canRequest && <th>Quote</th>}
                    {!this.props.canRequest && <th>Eligibility</th>}
                    {this.props.canRequest && <th>Submitted?</th>}
                    <th>Auto-Accept Ranked</th>
                    <th>Auto-Accept Unranked</th>
                  </tr>
                </thead>
                <tbody>{!this.props.loading && teamRows}</tbody>
              </table>
              {this.props.loading && <Spinner />}
            </div>
            <PaginationControl
              page={props.page}
              pageLimit={props.pageLimit}
              onPageClick={props.onPageClick}
            />
          </div>
        </div>
      );
    }
  }
}

export default RankingTeamList;
