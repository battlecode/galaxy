import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import Api from "./api";
import $ from "jquery";

class NLink extends Component {
  render() {
    return (
      <li>
        <NavLink {...this.props} activeStyle={{ opacity: 1, fontWeight: 800 }}>
          <p
            style={{
              fontWeight: "inherit",
              textTransform: "none",
              fontSize: "inherit",
            }}
          >
            <i className={this.props.icon} pe-fw />
            {this.props.label}
          </p>
        </NavLink>
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
          {/* NOTE: this only controls what appears in the sidebars.
          Independent of this, users can still go to the links by typing it in their browser, etc.
          MAKE SURE THAT THE LINKED PAGES THEMSELVES ARE SECURE,
          ESPECIALLY THAT THEY DON'T ALLOW ACCESS/FUNCTIONALITY WHEN THEY SHOULDN'T */}
          <ul className="nav nav-pills nav-stacked">
            {/* This invisible element is needed for proper spacing */}
            <NLink to={`#`} style={{ visibility: "hidden" }}></NLink>
            <NLink to={`/home`} icon={"pe-7s-home"} label="Home" />
            <NLink
              to={`/getting-started`}
              icon={"pe-7s-sun"}
              label="Getting Started"
            />
            <NLink to={`/resources`} icon={"pe-7s-note2"} label="Resources" />
            <NLink to={`/updates`} icon={"pe-7s-bell"} label="Updates" />

            <br />

            <NLink
              to={`/tournaments`}
              icon={"pe-7s-medal"}
              label="Tournaments"
            />
            <NLink to={`/rankings`} icon={"pe-7s-graph1"} label="Rankings" />
            {/* search bar link, unused since Search is broken
            Commented in case someone wants to bring it back in the future
            You'd have to refactor the code to match the other NLink's */}
            {/* <NLink to={`/search`}><p style={{fontWeight: "inherit", textTransform: "none", fontSize: "inherit"}}><i className="pe-7s-search pe-fw" />Search</p></NLink> */}

            <br />

            {/* Only visible when logged in */}
            {this.state.logged_in && (
              <NLink to={`/team`} icon={"pe-7s-users"} label="Team" />
            )}

            {/* Only visible when on a team AND submissions are enabled */}
            {this.state.on_team && this.isSubmissionEnabled() && (
              <NLink
                to={`/submissions`}
                icon={"pe-7s-up-arrow "}
                label="Submissions"
              />
            )}

            {/* Only visible when on a team AND submissions are enabled
            Tried to de-dupe, but expressions must return only one JSX element,
            and I couldn't get both NLinks to be in the same element while still looking ok
            Do at your own risk
            - Nathan */}
            {this.state.on_team && this.isSubmissionEnabled() && (
              <NLink
                to={`/scrimmaging`}
                icon={"pe-7s-joy "}
                label="Scrimmaging"
              />
            )}

            <br />

            {/* Only visible if a staff user */}
            {this.state.user.is_staff && (
              <NLink to={`/staff`} icon={"pe-7s-tools "} label="Staff" />
            )}

            <br />
          </ul>
        </div>
      </div>
    );
  }
}

export default SideBar;
