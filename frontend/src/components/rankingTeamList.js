import React from "react";
import { useHistory } from "react-router-dom";

import TeamList from "./teamList";
import PaginationControl from "./paginationControl";

class RankingTeamList extends TeamList {
  redirectToTeamPage = (team_id) => {
    // this.props.history.push(`/rankings/${team_id}`);
  };

  render() {
    const { props, state } = this;

    if (!props.teams) {
      return null;
    } else if (props.teams.length === 0) {
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
          <tr key={team.id} onClick={() => this.redirectToTeamPage(team.id)}>
            {<td>{Math.round(team.profile.rating)}</td>}
            <td>{team.name}</td>
            <td>{team.members.map((member) => member.username).join(", ")}</td>
            {<td>{team.profile.quote}</td>}
            <td>
              {this.props.episode_info.eligibility_criteria.map((criterion) => {
                const eligible = team.profile.eligible_for.includes(
                  criterion.id
                );
                return (
                  <span key={criterion.id}>
                    {eligible ? criterion.icon : ""}
                  </span>
                );
              })}
            </td>
            {/* <td>{team.auto_accept_unranked ? "Yes" : "No"}</td> */}
            {/* {props.canRequest && (
              <td>
                <button
                  className="btn btn-xs"
                  onClick={() => this.onTeamRequest(team.id)}
                >
                  {buttonContent}
                </button>{" "}
              </td>
            )} */}
          </tr>
        );
      });

      return (
        <div>
          <div className="card">
            <div className="header">
              <h4 className="title">Rankings</h4>
            </div>
            <div className="content table-responsive table-full-width">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Rating</th>
                    <th>Team</th>
                    <th>Members</th>
                    <th>Quote</th>
                    <th>Eligibility</th>
                    {/* <th>Auto-Accept</th> */}
                  </tr>
                </thead>
                <tbody>{teamRows}</tbody>
              </table>
            </div>
          </div>
          <PaginationControl
            page={props.page}
            pageLimit={props.pageLimit}
            onPageClick={props.onPageClick}
          />
        </div>
      );
    }
  }
}

export default RankingTeamList;
