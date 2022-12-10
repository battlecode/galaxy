import React, { Component } from "react";
import $ from "jquery";
import { PieChart } from "chartist";

import Api from "../api";
import Countdown from "../components/countdown";
import UpdateCard from "../components/updateCard";

class StatCard extends UpdateCard {
  constructor(props) {
    super(props);
    this.state = {
      matchesplayed: false,
    };
  }

  componentDidMount() {
    // Api.getTeamWinStats(
    //   function (stats) {
    //     if (stats[0] == 0 && stats[1] == 0) {
    //       this.setState({ matchesplayed: false });
    //     } else {
    //       this.setState({ matchesplayed: true }, function () {
    //         return new PieChart("#stat_chart", {
    //           labels: stats,
    //           series: stats,
    //         });
    //       });
    //     }
    //   }.bind(this)
    // );
  }

  render() {
    return (
      <div className="card">
        <div className="header">
          <h4 className="title">Match Statistics</h4>
          <p className="category">Wins and losses.</p>
        </div>
        {!this.state.matchesplayed && (
          <p className="content">
            Match statistics will appear here after your first match!
          </p>
        )}
        {this.state.matchesplayed && (
          <div className="content">
            <div id="stat_chart" className="ct-chart ct-perfect-fourth" />
            <div className="footer">
              <div className="legend">
                <i className="fa fa-circle text-info" /> Win
                <span style={{ marginLeft: "10px" }}> </span>
                <i className="fa fa-circle text-danger" /> Loss
              </div>
              <hr />
              {this.getFooter()}
            </div>
          </div>
        )}
      </div>
    );
  }
}

class DateCard extends UpdateCard {
  constructor() {
    super();
    this.state.dates = [];
  }

  componentDidMount() {
    // The backend does not currently support making/retrieving a list of
    // announcements, so this has been commented out for now.
    /*
    Api.getUpdates(
      function (dates) {
        this.setState({ dates: dates.length > 5 ? dates.slice(0, 5) : dates });
        if (dates[0]) {
          this.setState({ update_date: dates[0].dateObj });
        }
      }.bind(this)
    );
    */
  }

  render() {
    return (
      <div className="card">
        <div className="header">
          <h4 className="title">Recent Updates</h4>
          <p className="category">
            A full listing can be found in the sidebar.
          </p>
        </div>
        <div className="content">
          <div className="table-full-width">
            <table className="table">
              <tbody>
                {this.state.dates.map((date) => (
                  <tr key={date.id}>
                    <td>{date.time}</td>
                    <td>{date.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {this.getFooter()}
        </div>
      </div>
    );
  }
}

class InstrCard extends UpdateCard {
  constructor() {
    super();
    this.state = {
      dates: [],
    };
  }

  render() {
    return (
      <div className="card">
        <div className="header">
          <h4 className="title">Welcome to {this.props.episode_name_long}!</h4>
        </div>
        <div className="content">
          <p>
            Please join our <a href="https://discord.gg/N86mxkH">Discord</a>,
            and follow our{" "}
            <a href="https://www.facebook.com/mitbattlecode">Facebook</a> and{" "}
            <a href="https://www.instagram.com/mitbattlecode/">Instagram</a>!
          </p>
          {/* <p>
            Come to the Final Tournament,{" "}
            <b>at MIT in Stata (32-123) at 7pm on February 5</b>. You can still
            play matches -- find the specs (and javadocs!) in the resources tab!
          </p> */}
        </div>
      </div>
    );
  }
}

class LinksCard extends Component {
  constructor() {
    super();
  }

  componentDidMount() {
    // meh
  }

  render() {
    return (
      <div className="card">
        <div className="header">
          <h4 className="title">Useful Links</h4>
        </div>
        <div className="content">
          <ul>
            <li>
              <a href="https://discord.gg/N86mxkH">Discord</a> -{" "}
              <b>for all official announcements and our community</b>
            </li>
            <li>
              <a href="https://www.facebook.com/mitbattlecode">Facebook</a> and{" "}
              <a href="https://www.instagram.com/mitbattlecode/">Instagram</a> -{" "}
              <b>for event announcements and photos</b>
            </li>
            <li>
              <a href="https://github.com/battlecode">GitHub</a>
            </li>
            <li>
              <a href="https://twitch.tv/mitbattlecode">Twitch</a>
            </li>
            <li>
              <a href="https://battlecode.org">Battlecode.org</a>
              <ul>
                <li>
                  <a href="https://battlecode.org/schedule.html">Schedule</a>
                </li>
                <li>
                  <a href="https://battlecode.org/about.html">Eligibility</a>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    );
  }
}

class Home extends Component {
  render() {
    return (
      <div className="content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-6">
              <div className="container-fluid">
                <div className="row">
                  <InstrCard episode_name_long={this.props.episode_name_long} />
                </div>
                <div className="row">
                  <Countdown />
                </div>
                <div className="row">{this.props.on_team && <StatCard />}</div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="container-fluid">
                {/* <div className="row">
                  <DateCard />
                </div> */}
                <div className="row">
                  <LinksCard />
                </div>
                <div className="row">
                  {/*{this.state.on_team && <PerfCard team={null} />}*/}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Home;
