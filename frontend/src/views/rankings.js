import React, { Component } from "react";
import Api from "../api";

import RankingTeamList from "../components/rankingTeamList";

class Rankings extends Component {
  state = {
    teams: null,
    teamLimit: 0,
    teamPage: 1,
    input: "",
  };

  searchTeam(input, page) {
    Api.searchTeam(input, page, this.props.episode, (teams) => {
      this.setState({ teams, teamPage: page });
    });
  }

  componentDidMount() {
    const { input } = this.state;
    this.searchTeam(input, 1);
  }

  handleChange = (e) => {
    this.setState({ input: e.target.value });
  };

  getTeamPage = (page) => {
    const { state } = this;
    if (page !== state.teamPage && page >= 0) {
      this.searchTeam(this.state.input, page);
    }
  };

  search = (e) => {
    e.preventDefault();
    this.searchTeam(this.state.input, 1);
  };

  render() {
    const { state } = this;
    return (
      <div className="content">
        <div className="container-fluid row">
          <div className="col-md-12">
            <div className="card">
              <div className="content">
                <form className="input-group" onSubmit={this.search}>
                  <input
                    type="text"
                    className="form-control"
                    onChange={this.handleChange}
                    placeholder="Search for a Team or User..."
                  />
                  <span className="input-group-btn">
                    <button
                      className="btn btn-default"
                      type="submit"
                      value="Submit"
                    >
                      Go!
                    </button>
                  </span>
                </form>
              </div>
            </div>
          </div>
          <div className="col-md-12">
            <RankingTeamList
              teams={state.teams}
              page={state.teamPage}
              onPageClick={this.getTeamPage}
              history={this.props.history}
              episode_info={this.props.episode_info}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default Rankings;
