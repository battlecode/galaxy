import React, { Component } from "react";
import Api from "../api";

import RankingTeamSearch from "../components/rankingTeamSearch";

class Rankings extends Component {
  render() {
    return (
      <div className="content">
        <div className="container-fluid row">
          <RankingTeamSearch
            episode={this.props.episode}
            episode_info={this.props.episode_info}
            search_placeholder="Search for a Team or User..."
            history={this.props.history}
            canRequest={false}
            requireActiveSubmission={false}
            team={this.props.team}
            title="Rankings"
          />
        </div>
      </div>
    );
  }
}

export default Rankings;
