import React, { Component } from "react";
import Api from "../api";
import Floater from "react-floater";
import MultiEpisode from "./multi-episode";
import { getDateTimeText } from "../utils/date";

import ScrimmageRequestor from "../components/scrimmageRequestor";
import Spinner from "../components/spinner";
import PaginationControl from "../components/paginationControl";

class ScrimmageRequest extends Component {
  state = {
    open: true,
  };

  accept = () => {
    Api.acceptScrimmage(
      this.props.id,
      function () {
        this.setState({ open: false });
        this.props.refresh();
      }.bind(this)
    );
  };

  reject = () => {
    Api.rejectScrimmage(
      this.props.id,
      function () {
        this.setState({ open: false });
        this.props.refresh();
      }.bind(this)
    );
  };

  render() {
    if (this.state.open)
      return (
        <div className="alert alert-dark" style={{ height: "3em" }}>
          <span style={{ float: "left" }}>
            Scrimmage request from {this.props.team}.
          </span>
          <span style={{ float: "right" }} className="pull-right">
            <button onClick={this.accept} className="btn btn-success btn-xs">
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
          team={r.requested_by}
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
          {requests}
        </div>
      </div>
    );
  }
}

class ScrimmageHistory extends Component {
  state = {
    scrimPage: 1,
    pageLimit: 0,
    scrimmages: [],
    loading: true,
  };

  refresh = (page) => {
    this.setState({ loading: true, scrimPage: page });
    Api.getTeamScrimmages(
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
    this.refresh(this.state.scrimPage);
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
      this.refresh(page);
    }
  };

  render() {
    return (
      <div className="col-md-12">
        <div className="card">
          <div className="header">
            <h4 className="title">
              Scrimmage History{" "}
              <button
                onClick={this.props.refresh}
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
                  <th>Creation time</th>
                  <th>Status</th>
                  <th>Score</th>
                  <th>Opponent</th>
                  <th>Ranked</th>
                  <th>Replay</th>
                </tr>
              </thead>
              <tbody>
                {this.state.scrimmages.map((s) => {
                  let stat_entry = <td>{s.status}</td>;
                  let participation =
                    s.participants[0].id == this.props.team.id
                      ? s.participants[0]
                      : s.participants[1];
                  let opponent_participation =
                    s.participants[0].id == this.props.team.id
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
                  const score_string =
                    s.status == "OK!"
                      ? `${participation.score} - ${opponent_participation.score}`
                      : "? - ?";
                  const created_date_text = getDateTimeText(
                    new Date(s.created)
                  );
                  const created_date_string = `${created_date_text.local_date_str} ${created_date_text.local_timezone}`;
                  return (
                    <tr key={s.id}>
                      <td>{created_date_string}</td>
                      {stat_entry}
                      <td>{score_string}</td>
                      <td>{opponent_participation.teamname}</td>
                      <td>{s.is_ranked ? "Ranked" : "Unranked"}</td>
                      {s.status == "OK!" ? (
                        <td>
                          {/* domain is hardcoded, since visualizer and replays are only hosted on deployed site, not locally */}
                          {/* note that episode_info.name_long is not quite the correct thing to use below: this is pending a
                            backend change */}
                          <a
                            href={`https://releases.battlecode.org/client/${this.props.episode_info.name_long}/1.0.0/visualizer.html`}
                            target="_blank"
                          >
                            Watch
                          </a>
                        </td>
                      ) : (
                        <td>N/A</td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {this.state.loading && <Spinner />}
          </div>
        </div>
        <PaginationControl
          page={this.state.scrimPage}
          pageLimit={this.state.pageLimit}
          onPageClick={this.getScrimPage}
        />
      </div>
    );
  }
}

class Scrimmaging extends Component {
  refresh = () => {
    this.requests.refresh();
    this.history.refresh(1);
  };

  render() {
    return (
      <div className="content">
        <div className="content">
          <div className="container-fluid">
            <div className="row">
              {/* <ScrimmageRequests
                ref={(requests) => {
                  this.requests = requests;
                }}
                refresh={this.refresh}
                episode={this.props.episode}
                episode_info={this.props.episode_info}
              /> */}
              <ScrimmageRequestor
                refresh={this.refresh}
                episode={this.props.episode}
                episode_info={this.props.episode_info}
                history={this.props.history}
                team={this.props.team}
              />
              <ScrimmageHistory
                ref={(history) => {
                  this.history = history;
                }}
                refresh={this.refresh}
                episode={this.props.episode}
                episode_info={this.props.episode_info}
                team={this.props.team}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Scrimmaging;
