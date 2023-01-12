import React, { Component } from "react";
import Api from "../api";

import { getDateTimeText } from "../utils/date";

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

class QueueHistory extends Component {
  state = {
    matchPage: 1,
    pageLimit: 0,
    matches: [],
    loading: true,
  };

  static formatRatingDelta(participation) {
    if (participation === null) {
      return <span>N/A</span>;
    }
    const old_rating = Math.round(participation.old_rating);
    const rating = Math.round(participation.rating);
    const color =
      rating > old_rating ? "green" : rating < old_rating ? "red" : "grey";
    return (
      <span>
        {old_rating} <b style={{ color }}>➞ {rating}</b>
      </span>
    );
  }

  loadPage = (page) => {
    this.setState({ loading: true, matches: [], matchPage: page });
    Api.getAllMatches(
      this.props.episode,
      function (matches, pageLimit) {
        // This check handles the case where a new page is requested while a
        // previous page was loading.
        if (page == this.state.matchPage) {
          this.setState({
            matches,
            pageLimit,
            loading: false,
          });
        }
      }.bind(this),
      page
    );
  };

  componentDidMount() {
    this.loadPage(this.state.matchPage);
  }

  getMatchPage = (page) => {
    if (
      page !== this.state.matchPage &&
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
      <div className="content">
        <div className="content">
          <div className="container-fluid">
            <div className="row">
              <div className="col-md-12">
                <div className="card">
                  <div className="header">
                    <h4 className="title">
                      Recent Queue{" "}
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
                          <th>Team (Δ)</th>
                          <th>Score</th>
                          <th>Team (Δ)</th>
                          <th>Ranked</th>
                          <th>Status</th>
                          <th>Creation time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {this.state.matches.map((s) => {
                          let stat_entry = <td>{MATCH_STATUS[s.status]}</td>;
                          let participation1 = null;
                          let participation2 = null;
                          if (s.participants !== null) {
                            participation1 = s.participants[0];
                            participation2 = s.participants[1];
                          }
                          if (s.status == "ERR") {
                            stat_entry = (
                              <td>
                                {s.status}
                                <Floater
                                  content={
                                    <div>
                                      <p>
                                        Our server has run into an error running
                                        this match. Don't worry, we're working
                                        on resolving it!
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
                          const score_entry = (
                            <td>
                              {s.status == "OK!" &&
                              participation1 != null &&
                              participation2 != null &&
                              participation1.score != null &&
                              participation2.score != null
                                ? `${participation1.score} - ${participation2.score}`
                                : s.status == "OK!"
                                ? "Hidden"
                                : "? - ?"}
                            </td>
                          );
                          const created_date_text = getDateTimeText(
                            new Date(s.created)
                          );
                          const created_date_string =
                            created_date_text.local_full_string;
                          const show_deltas = s.status == "OK!" && s.is_ranked;

                          return (
                            <tr key={s.id}>
                              <td>
                                {participation1 !== null
                                  ? participation1.teamname
                                  : "?"}{" "}
                                (
                                {show_deltas
                                  ? QueueHistory.formatRatingDelta(
                                      participation1
                                    )
                                  : "N/A"}
                                )
                              </td>
                              {score_entry}
                              <td>
                                {participation2 !== null
                                  ? participation2.teamname
                                  : "?"}{" "}
                                (
                                {show_deltas
                                  ? QueueHistory.formatRatingDelta(
                                      participation2
                                    )
                                  : "N/A"}
                                )
                              </td>
                              <td>{s.is_ranked ? "Ranked" : "Unranked"}</td>
                              {stat_entry}
                              <td>{created_date_string}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    {this.state.loading && <Spinner />}
                  </div>
                </div>
                <PaginationControl
                  page={this.state.matchPage}
                  pageLimit={Math.min(this.state.pageLimit, 25)}
                  onPageClick={this.getMatchPage}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default QueueHistory;
