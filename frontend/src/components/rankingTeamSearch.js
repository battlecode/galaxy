import React, { Component } from "react";
import Api from "../api";

import RankingTeamList from "./rankingTeamList";

class RankingTeamSearch extends Component {
  state = {
    teams: [],
    teamLimit: 0,
    teamPage: 1,
    loading: false,
    input: "",
  };

  searchTeam(input, page) {
    this.setState({ loading: true, teamPage: page });
    Api.searchTeam(
      input,
      page,
      this.props.episode,
      this.props.requireActiveSubmission,
      (teams, pageLimit) => {
        // This check handles the case where a new page is requested while a
        // previous page was loading.
        if (page == this.state.teamPage) {
          this.setState({ teams, pageLimit, loading: false });
        }
      }
    );
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
      <div>
        <div className="col-md-12">
          <div className="card">
            <div className="content">
              <form className="input-group" onSubmit={this.search}>
                <input
                  type="text"
                  className="form-control"
                  onChange={this.handleChange}
                  placeholder={this.props.search_placeholder}
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
            pageLimit={state.pageLimit}
            onPageClick={this.getTeamPage}
            loading={this.state.loading}
            history={this.props.history}
            episode={this.props.episode}
            episode_info={this.props.episode_info}
            canRequest={this.props.canRequest}
            team={this.props.team}
            title={this.props.title}
            requestRefresh={this.props.requestRefresh}
          />
        </div>
      </div>
    );
  }
}

export default RankingTeamSearch;
