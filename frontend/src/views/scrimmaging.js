import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import Api from "../api";
import Floater from "react-floater";
import MultiEpisode from "./multi-episode";
import { getDateTimeText } from "../utils/date";

import ScrimmageRequestor from "../components/scrimmageRequestor";
import Spinner from "../components/spinner";
import PaginationControl from "../components/paginationControl";

const MATCH_STATUS = {
  NEW: "Created",
  QUE: "Queued",
  RUN: "Running",
  TRY: "Will be retried",
  "OK!": "Success",
  ERR: "Failed",
  CAN: "Cancelled",
};

class ScrimmageRequest extends Component {
  state = {
    open: true,
  };

  accept = () => {
    Api.acceptScrimmage(
      this.props.id,
      this.props.episode,
      function () {
        this.setState({ open: false });
        this.props.refresh();
      }.bind(this)
    );
  };

  reject = () => {
    Api.rejectScrimmage(
      this.props.id,
      this.props.episode,
      function () {
        this.setState({ open: false });
        this.props.refresh();
      }.bind(this)
    );
  };

  render() {
    if (this.state.open)
      return (
        <div className="alert alert-success">
          Scrimmage request from {this.props.team}.
          <span style={{ float: "right" }} className="pull-right">
            <button
              onClick={this.accept}
              className="btn btn-success btn-xs"
              disabled={this.props.episode_info.frozen}
            >
              Accept
            </button>{" "}
            <button onClick={this.reject} className="btn btn-danger btn-xs">
              Reject
            </button>
          </span>
        </div>
      );
    else return <div></div>;
  }
}

class ScrimmageRequests extends Component {
  constructor(props) {
    super(props);

    this.state = {
      requests: [],
    };
  }

  refresh = () => {
    Api.getScrimmageRequests(
      this.props.episode,
      function (requests) {
        this.setState({ requests });
      }.bind(this)
    );
  };

  componentDidMount() {
    this.refresh();
  }

  render() {
    let requests = null;
    let alert = null;
    if (this.state.requests.length != 0) {
      requests = this.state.requests.map((r) => (
        <ScrimmageRequest
          refresh={this.props.refresh}
          key={r.id}
          id={r.id}
          team={r.requested_by_name}
          episode={this.props.episode}
          episode_info={this.props.episode_info}
        />
      ));
      alert = (
        <div
          className="alert alert-info pending-header collapsed"
          data-toggle="collapse"
          data-target="#scrimReqs"
        >
          You have pending scrimmages!
          <span className="bold"> HIDE </span>
          <b> SHOW </b>
        </div>
      );
    }
    return (
      <div className="col-md-12">
        {alert}
        <div className="collapse" id="scrimReqs">
          {this.props.episode_info.frozen && (
            <div className="alert alert-warning">
              Scrimmage requests may not be accepted, due to a freeze for a
              tournament. (If you think the freeze has passed, try refreshing
              the page.)
            </div>
          )}
          {requests}
        </div>
      </div>
    );
  }
}

class MatchHistory extends Component {
  state = {
    scrimPage: 1,
    pageLimit: 0,
    scrimmages: [],
    loading: true,
  };

  static formatRatingDelta(participation) {
    const old_rating = Math.round(participation.old_rating);
    const rating = Math.round(participation.rating);
    const rating_diff = Math.abs(rating - old_rating);
    const rating_diff_text =
      rating > old_rating
        ? " +" + rating_diff
        : rating < old_rating
        ? " –" + Math.abs(rating_diff)
        : " ±0";
    const color =
      rating > old_rating ? "green" : rating < old_rating ? "red" : "grey";
    return (
      <span>
        {old_rating}
        <small style={{ color }}>
          {participation.rating !== null ? rating_diff_text : ""}
        </small>
      </span>
    );
  }

  loadPage = (page) => {
    this.setState({ loading: true, scrimmages: [], scrimPage: page });
    const apiFunc = this.props.show_tournament_matches
      ? Api.getTeamTournamentMatches
      : Api.getTeamScrimmages;
    apiFunc(
      this.props.team.id,
      this.props.episode,
      function (scrimmages, pageLimit) {
        // This check handles the case where a new page is requested while a
        // previous page was loading.
        if (page == this.state.scrimPage) {
          this.setState({
            scrimmages,
            pageLimit,
            loading: false,
          });
        }
      }.bind(this),
      page
    );
  };

  componentDidMount() {
    this.loadPage(this.state.scrimPage);
  }

  playReplay(e) {
    e.preventDefault();
    var url = e.target.href;
    window.open(
      url,
      "replay_window",
      "scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=600,height=750"
    );
  }

  getScrimPage = (page) => {
    if (
      page !== this.state.scrimPage &&
      page >= 0 &&
      page <= this.state.pageLimit
    ) {
      this.loadPage(page);
    }
  };

  refresh = () => {
    this.loadPage(1);
  };

  render() {
    return (
      <div className="col-md-12">
        <div className="card">
          <div className="header">
            <h4 className="title">
              {this.props.show_tournament_matches
                ? "Tournament Match"
                : "Scrimmage"}{" "}
              History{" "}
              <button
                onClick={this.refresh}
                style={{ marginLeft: "10px" }}
                type="button"
                className="btn btn-primary btn-sm"
              >
                Refresh
              </button>
            </h4>
          </div>
          <div className="content table-responsive table-full-width">
            <table className="table table-hover table-striped">
              <thead>
                <tr>
                  <th>Score</th>
                  {!this.props.show_tournament_matches && <th>Δ</th>}
                  <th>Opponent {!this.props.show_tournament_matches && "Δ"}</th>
                  {!this.props.show_tournament_matches && <th>Ranked</th>}
                  <th>Status</th>
                  <th>Replay</th>
                  <th>Creation time</th>
                </tr>
              </thead>
              <tbody>
                {this.state.scrimmages.map((s) => {
                  let stat_entry = <td>{MATCH_STATUS[s.status]}</td>;
                  let participation =
                    s.participants[0].team == this.props.team.id
                      ? s.participants[0]
                      : s.participants[1];
                  let opponent_participation =
                    s.participants[0].team == this.props.team.id
                      ? s.participants[1]
                      : s.participants[0];
                  if (s.status == "ERR") {
                    stat_entry = (
                      <td>
                        {s.status}
                        <Floater
                          content={
                            <div>
                              <p>
                                Our server has run into an error running this
                                scrimmage. Don't worry, we're working on
                                resolving it!
                              </p>
                            </div>
                          }
                          showCloseButton={true}
                        >
                          <i className="pe-7s-info pe-fw" />
                        </Floater>
                      </td>
                    );
                  }
                  const score_class =
                    s.status !== "OK!"
                      ? ""
                      : participation.score > opponent_participation.score
                      ? "success"
                      : "danger";
                  const score_entry = (
                    <td class={score_class}>
                      {s.status == "OK!"
                        ? `${participation.score} - ${opponent_participation.score}`
                        : "? - ?"}
                    </td>
                  );
                  const created_date_text = getDateTimeText(
                    new Date(s.created)
                  );
                  const created_date_string =
                    created_date_text.local_full_string;

                  return (
                    <tr key={s.id}>
                      {score_entry}
                      {!this.props.show_tournament_matches && (
                        <td>{MatchHistory.formatRatingDelta(participation)}</td>
                      )}
                      <td>
                        <NavLink
                          to={`/${this.props.episode}/rankings/${opponent_participation.team}`}
                        >
                          {opponent_participation.teamname}
                        </NavLink>{" "}
                        (
                        {!this.props.show_tournament_matches &&
                          MatchHistory.formatRatingDelta(
                            opponent_participation
                          )}
                        )
                      </td>
                      {!this.props.show_tournament_matches && (
                        <td>{s.is_ranked ? "Ranked" : "Unranked"}</td>
                      )}
                      {stat_entry}
                      {s.status == "OK!" ? (
                        <td>
                          <a
                            href={`https://releases.battlecode.org/client/${this.props.episode_info.artifact_name}/${this.props.episode_info.release_version_public}/index.html?gameSource=${s.replay_url}`}
                            target="_blank"
                          >
                            Watch
                          </a>
                        </td>
                      ) : (
                        <td>N/A</td>
                      )}
                      <td>{created_date_string}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {this.state.loading && <Spinner />}
          </div>
          <PaginationControl
            page={this.state.scrimPage}
            pageLimit={this.state.pageLimit}
            onPageClick={this.getScrimPage}
          />
        </div>
      </div>
    );
  }
}

class Scrimmaging extends Component {
  refresh = () => {
    this.requests.refresh();
    this.history.loadPage(1);
  };

  render() {
    return (
      <div className="content">
        <div className="content">
          <div className="container-fluid">
            <div className="row">
              <ScrimmageRequests
                ref={(requests) => {
                  this.requests = requests;
                }}
                refresh={this.refresh}
                episode={this.props.episode}
                episode_info={this.props.episode_info}
              />
              <ScrimmageRequestor
                refresh={this.refresh}
                episode={this.props.episode}
                episode_info={this.props.episode_info}
                history={this.props.history}
                team={this.props.team}
              />
              <MatchHistory
                ref={(history) => {
                  this.history = history;
                }}
                refresh={this.refresh}
                episode={this.props.episode}
                episode_info={this.props.episode_info}
                team={this.props.team}
                show_tournament_matches={false}
              />
              <MatchHistory
                ref={(history) => {
                  this.history = history;
                }}
                refresh={this.refresh}
                episode={this.props.episode}
                episode_info={this.props.episode_info}
                team={this.props.team}
                show_tournament_matches={true}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Scrimmaging;
