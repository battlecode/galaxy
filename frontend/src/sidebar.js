import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import Api from "./api";
import $ from "jquery";
import MultiEpisode from "./views/multi-episode";

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
            <i className={`${this.props.icon} pe-fw`} />
            {this.props.label}
          </p>
        </NavLink>
      </li>
    );
  }
}

class SideBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      league: {},
    };
  }

  // This is messy, will clean in #91
  componentDidMount() {
    // This function, for mobile devices, moves the navbar into the sidebar and then
    // collapses the sidebar. Better responsive display
    // (Only call it when the entire DOM has fully loaded, since otherwise,
    // the _incomplete_ navbar gets moved and is stuck there.)
    // See `light-bootstrap-dashboard.js`, and its `initRightMenu` method
    $(document).ready(function () {
      window.init_right_menu();
    });

    Api.getLeague((league) => {
      this.setState({ league }); // TODO: update league function here
    });
  }

  // Note that this duplicates a method in submissions.js;
  // this will be cleaned up. See #74
  isGameReleasedForUser() {
    if (this.props.is_staff) {
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
              <img src="/bc/img/logo.png" />
            </a>
            <p>Battlecode {this.props.episode}</p>
          </div>
          {/* NOTE: this only controls what appears in the sidebars.
          Independent of this, users can still go to the links by typing it in their browser, etc.
          MAKE SURE THAT THE LINKED PAGES THEMSELVES ARE SECURE,
          ESPECIALLY THAT THEY DON'T ALLOW ACCESS/FUNCTIONALITY WHEN THEY SHOULDN'T */}
          <ul className="nav nav-pills nav-stacked">
            {/* This invisible element is needed for proper spacing */}
            <NLink to={`#`} style={{ visibility: "hidden" }}></NLink>
            <NLink
              to={`/${this.props.episode}/home`}
              icon={"pe-7s-home"}
              label="Home"
            />
            <NLink
              to={`/${this.props.episode}/getting-started`}
              icon={"pe-7s-sun"}
              label="Getting Started"
            />
            <NLink
              to={`/${this.props.episode}/resources`}
              icon={"pe-7s-note2"}
              label="Resources"
            />
            <NLink
              to={`/${this.props.episode}/updates`}
              icon={"pe-7s-bell"}
              label="Updates"
            />

            <br />

            <NLink
              to={`/${this.props.episode}/tournaments`}
              icon={"pe-7s-medal"}
              label="Tournaments"
            />
            <NLink
              to={`/${this.props.episode}/rankings`}
              icon={"pe-7s-graph1"}
              label="Rankings"
            />
            {/* search bar link, unused since Search is broken
            Commented in case someone wants to bring it back in the future
            You'd have to refactor the code to match the other NLink's */}
            {/* <NLink to={`/search`}><p style={{fontWeight: "inherit", textTransform: "none", fontSize: "inherit"}}><i className="pe-7s-search pe-fw" />Search</p></NLink> */}

            <br />

            {/* Only visible when logged in */}
            {this.props.logged_in && (
              <NLink
                to={`/${this.props.episode}/team`}
                icon={"pe-7s-users"}
                label="Team"
              />
            )}

            {/* #74 considers combining these two checks and &&, into one*/}
            {/* Only visible when on a team AND game is released */}
            {this.props.on_team && this.isGameReleasedForUser() && (
              <NLink
                to={`/${this.props.episode}/submissions`}
                icon={"pe-7s-up-arrow"}
                label="Submissions"
              />
            )}

            {/* Only visible when on a team AND game is released
            Tried to de-dupe, but expressions must return only one JSX element,
            and I couldn't get both NLinks to be in the same element while still looking ok
            Do at your own risk
            - Nathan */}
            {this.props.on_team && this.isGameReleasedForUser() && (
              <NLink
                to={`/${this.props.episode}/scrimmaging`}
                icon={"pe-7s-joy"}
                label="Scrimmaging"
              />
            )}

            <br />

            {/* Only visible if a staff user */}
            {this.props.is_staff && (
              <NLink
                to={`/${this.props.episode}/staff`}
                icon={"pe-7s-tools"}
                label="Staff"
              />
            )}

            <br />
          </ul>
        </div>
      </div>
    );
  }
}

export default SideBar;
