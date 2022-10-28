import React, { Component } from "react";
import Api from "../api";
import Floater from "react-floater";
import MultiEpisode from "./multi-episode";

import ScrimmageRequestor from "../components/scrimmageRequestor";
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
  state = {
    requests: [],
  };

  refresh = () => {
    Api.getScrimmageRequests(
      function (r) {
        this.setState({ requests: r });
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
          team={r.team}
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
    scrimLimit: 0,
    scrimmages: [],
    episode: MultiEpisode.getEpisodeFromCurrentPathname(),
  };

  refresh = (page) => {
    Api.getScrimmageHistory(
      function (s) {
        this.setState({ ...s, scrimPage: page });
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
      page <= this.state.scrimLimit
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
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Score</th>
                  <th>Team</th>
                  <th>Ranked</th>
                  <th>Replay</th>
                </tr>
              </thead>
              <tbody>
                {this.state.scrimmages.map((s) => {
                  let stat_row = <td>{s.status}</td>;
                  if (s.status.toLowerCase() == "error") {
                    stat_row = (
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
                              <p>Error: {s.error_msg}</p>
                            </div>
                          }
                          showCloseButton={true}
                        >
                          <i className="pe-7s-info pe-fw" />
                        </Floater>
                      </td>
                    );
                  }
                  return (
                    <tr key={s.id}>
                      <td>{s.date}</td>
                      <td>{s.time}</td>
                      {stat_row}
                      <td>{s.score}</td>
                      <td>{s.team}</td>
                      <td>{s.ranked ? "Ranked" : "Unranked"}</td>
                      {s.replay ? (
                        <td>
                          {/* domain is hardcoded, since visualizer and replays are only hosted on deployed site, not locally */}
                          <a
                            href={`https://play.battlecode.org/clients/${this.state.episode}/visualizer.html?https://play.battlecode.org/replays/${s.replay}.bc22`}
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
          </div>
        </div>
        <PaginationControl
          page={this.state.scrimPage}
          pageLimit={this.state.scrimLimit}
          onPageClick={(page) => this.getScrimPage(page)}
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
              <ScrimmageRequests
                ref={(requests) => {
                  this.requests = requests;
                }}
                refresh={this.refresh}
              />
              <ScrimmageRequestor refresh={this.refresh} />
              <ScrimmageHistory
                ref={(history) => {
                  this.history = history;
                }}
                refresh={this.refresh}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Scrimmaging;
