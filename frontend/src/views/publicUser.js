import React, { Component } from "react";

import UserCard from "../components/userCard";
import TeamCard from "../components/teamCard";
import Api from "../api";

class PublicUser extends Component {
  constructor(props) {
    super(props);

    const user_id = props.match.params.user_id;

    this.state = {
      user_id: user_id,
      user: null,
      teams: null,
    };
  }

  componentDidMount() {
    // Get user info
    Api.getProfileByUser(this.state.user_id, (user) => {
      this.setUser(user);
    });
    // Get user teams
    Api.getUserTeams(this.state.user_id, (teams_dict) => {
      this.setTeams(teams_dict);
    });
  }

  setUser = (user_data) => {
    this.setState({ user: user_data });
  };

  setTeams = (teams_data) => {
    this.setState({ teams: teams_data });
  };

  render() {
    return (
      <div className="content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-4">
              {this.state.user && <UserCard user={this.state.user} />}
            </div>
            <div className="col-md-4">
              {this.state.teams &&
                Object.keys(this.state.teams).map((episode) => (
                  <TeamCard key={episode} team={this.state.teams[episode]} />
                ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default PublicUser;
