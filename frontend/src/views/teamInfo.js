import React, { Component } from "react";

import Api from "../api";

import TeamCard from "../components/teamCard";
import PerfCard from "../components/perfCard";

class RankCard extends Component {
  constructor() {
    super();
    this.state = {
      ranking: null,
    };
  }

  componentDidMount() {
    Api.getTeamRanking(this.props.teamId, this.setRanking);
  }

  setRanking = (ranking_data) => {
    this.setState({ ranking: ranking_data.ranking });
  };

  render() {
    const { ranking } = this.state;
    const rankStr = ranking || "-";
    const rankStyle = ranking ? {} : { visibility: "hidden" };
    return (
      <div className="card">
        <div className="content">
          <div className="col-2-row col-2-row-skinny">
            <label>rank</label>
            <h1 style={rankStyle}>{rankStr}</h1>
          </div>
          <br></br>
          <p style={{ textAlign: "center" }}>
            Score:{" "}
            {this.props.team.score === -1000000
              ? "N/A"
              : Math.round(this.props.team.score)}
          </p>
        </div>
      </div>
    );
  }
}

class WinsCard extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { wins, draws, losses } = this.state;
    return (
      <div className="card">
        <div className="content">
          <div className="col-2-row">
            <div className="row-items-box items-box-center items-box-skinny">
              <label>wins</label>
              <h1>{this.props.wins}</h1>
            </div>
            <div className="row-items-box items-box-center items-box-skinny">
              <label>losses</label>
              <h1>{this.props.losses}</h1>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

// This is the component in question being rendered
class TeamInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // Note that this prop comes from route-matching.
      // (The route to make this is /:episode/rankings/:team_id
      // and the :team_id part makes props.match.params.team_id
      // whatever that id is)
      id: this.props.match.params.team_id,
      team: null,
      wins: 0,
      losses: 0,
    };
  }

  componentDidMount() {
    //get team info by id
    const teamId = this.props.match.params.team_id;
    const episode = this.props.match.params.episode;

    Api.getTeamProfile(episode, teamId, this.setTeam);

    // Commented out since we don't have scrimmages, records, etc.
    // Work on this once we are ready to.
    // Track in #368.
    // Api.getOtherTeamWinStats(teamId, (data) => {
    //   this.setState({ wins: data[0], losses: data[1] });
    // });
  }

  setTeam = (team) => {
    this.setState({ team });
  };

  render() {
    const team = this.state.team;
    if (team !== null) {
      return (
        <div className="content">
          <div className="container-fluid">
            <div className="row">
              <TeamCard team={team} episode={this.props.match.params.episode} />
            </div>
            {/* Commented out since we don't have scrimmages, records, etc.
            Work on this once we are ready to.
            Do in #368 */}
            {/* <div className="row">
              <div className="col-md-3">
                <div className="container-fluid">
                  <div className="row">
                    <RankCard teamId={team.id} team={team} />
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="container-fluid">
                  <div className="row">
                    <WinsCard
                      wins={this.state.wins}
                      losses={this.state.losses}
                    />
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="container-fluid">
                  <div className="row">
                    <PerfCard team={team.id} />
                  </div>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      );
    } else {
      return null;
    }
  }
}

export default TeamInfo;
