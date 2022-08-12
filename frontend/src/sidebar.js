import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import Api from "./api";
import $ from "jquery";

class NLink extends Component {
  render() {
    return (
      <li>
        <NavLink
          {...this.props}
          activeStyle={{ opacity: 1, fontWeight: 800 }}
        />
      </li>
    );
  }
}

class SideBar extends Component {
  constructor() {
    super();
    this.state = { on_team: null, logged_in: null, user: {}, league: {} };
  }

  componentDidMount() {
    // Yes, the method surrounding loginCheck is duped across index, sidebar, and navbar.
    // But, it's just one method and one identical bit of code.
    // And, I did try to dedupe, but it didn't work out easily.
    // (Issues arise from callbacks, async-ness, etc...)
    // Try at your own risk, and if you dupe,
    // _make sure to keep the methods as small as possible, and keep these notes (about duping) around_
    // -Nathan
    Api.loginCheck((logged_in) => {
      this.setState({ logged_in });
    });

    Api.getUserProfile((user_profile) => {
      this.setState({ user: user_profile });
    });

    Api.getUserTeam((user_team_data) => {
      this.setState({ on_team: user_team_data !== null });
      // This function, for mobile devices, moves the navbar into the sidebar and then
      // collapses the sidebar. Better responsive display
      // (Only call it when the entire DOM has fully loaded, since otherwise,
      // the _incomplete_ navbar gets moved and is stuck there.)
      // See `light-bootstrap-dashboard.js`, and its `initRightMenu` method
      $(document).ready(function () {
        window.init_right_menu();
      });
    });

    Api.getLeague((league) => {
      this.setState({ league });
    });
  }

  isSubmissionEnabled() {
    if (this.state.user.is_staff == true) {
      return true;
    }
    if (this.state.league.game_released == true) {
      return true;
    }
    return false;
  }

  // for icon options below, see https://themes-pixeden.com/font-demos/7-stroke/

  render() {
    return (
      <div className="sidebar" data-color="anomoly">
        {" "}
        {/* data-color is defined in light-bootstrap-dashboard.css */}
        <div className="sidebar-wrapper">
          <div className="logo">
            <a href="/home">
              <img src="../assets/img/logo.png" />
            </a>
            <p>Battlecode 2022</p>
          </div>
          <ul className="nav nav-pills nav-stacked">
            <NLink to={`#`} style={{ visibility: "hidden" }}></NLink>
            <NLink to={`${process.env.PUBLIC_URL}/home`}>
              <p
                style={{
                  fontWeight: "inherit",
                  textTransform: "none",
                  fontSize: "inherit",
                }}
              >
                <i className="pe-7s-home pe-fw" />
                Home
              </p>
            </NLink>
            <NLink to={`${process.env.PUBLIC_URL}/getting-started`}>
              <p
                style={{
                  fontWeight: "inherit",
                  textTransform: "none",
                  fontSize: "inherit",
                }}
              >
                <i className="pe-7s-sun pe-fw" />
                Getting Started
              </p>
            </NLink>
            <NLink to={`${process.env.PUBLIC_URL}/resources`}>
              <p
                style={{
                  fontWeight: "inherit",
                  textTransform: "none",
                  fontSize: "inherit",
                }}
              >
                <i className="pe-7s-note2 pe-fw" />
                Resources
              </p>
            </NLink>
            <NLink to={`${process.env.PUBLIC_URL}/updates`}>
              <p
                style={{
                  fontWeight: "inherit",
                  textTransform: "none",
                  fontSize: "inherit",
                }}
              >
                <i className="pe-7s-bell pe-fw" />
                Updates
              </p>
            </NLink>

            <br />

            <NLink to={`${process.env.PUBLIC_URL}/tournaments`}>
              <p
                style={{
                  fontWeight: "inherit",
                  textTransform: "none",
                  fontSize: "inherit",
                }}
              >
                <i className="pe-7s-medal pe-fw" />
                Tournaments
              </p>
            </NLink>
            <NLink to={`${process.env.PUBLIC_URL}/rankings`}>
              <p
                style={{
                  fontWeight: "inherit",
                  textTransform: "none",
                  fontSize: "inherit",
                }}
              >
                <i className="pe-7s-graph1 pe-fw" />
                Rankings
              </p>
            </NLink>
            {/*<NLink to={`${process.env.PUBLIC_URL}/search`}><p style={{fontWeight: "inherit", textTransform: "none", fontSize: "inherit"}}><i className="pe-7s-search pe-fw" />Search</p></NLink>*/}

            <br />

            {this.state.logged_in && (
              <NLink to={`${process.env.PUBLIC_URL}/team`}>
                <p
                  style={{
                    fontWeight: "inherit",
                    textTransform: "none",
                    fontSize: "inherit",
                  }}
                >
                  <i className="pe-7s-users pe-fw" />
                  Team
                </p>
              </NLink>
            )}
            {this.state.on_team && (
              <NLink to={`${process.env.PUBLIC_URL}/submissions`}>
                <p
                  style={{
                    fontWeight: "inherit",
                    textTransform: "none",
                    fontSize: "inherit",
                  }}
                >
                  <i className="pe-7s-up-arrow pe-fw" />
                  Submissions
                </p>
              </NLink>
            )}
            {/*{ this.state.on_team && <NLink to={`${process.env.PUBLIC_URL}/ide`}><p style={{fontWeight: "inherit", textTransform: "none", fontSize: "inherit"}}><i className="pe-7s-pen pe-fw" />IDE</p></NLink> }*/}
            {this.state.on_team && this.isSubmissionEnabled() && (
              <NLink to={`${process.env.PUBLIC_URL}/scrimmaging`}>
                <p
                  style={{
                    fontWeight: "inherit",
                    textTransform: "none",
                    fontSize: "inherit",
                  }}
                >
                  <i className="pe-7s-joy pe-fw" />
                  Scrimmaging
                </p>
              </NLink>
            )}
            {/*<NLink to={`${process.env.PUBLIC_URL}/replay`}><p style={{fontWeight: "inherit", textTransform: "none", fontSize: "inherit"}}><i className="pe-7s-monitor pe-fw" />Replay</p></NLink>*/}

            <br />

            {this.state.user.is_staff && (
              <NLink to={`${process.env.PUBLIC_URL}/staff`}>
                <p
                  style={{
                    fontWeight: "inherit",
                    textTransform: "none",
                    fontSize: "inherit",
                  }}
                >
                  <i className="pe-7s-tools pe-fw" />
                  Staff
                </p>
              </NLink>
            )}

            <br />
          </ul>
        </div>
      </div>
    );
  }
}

export default SideBar;
