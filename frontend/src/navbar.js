import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import Api from "./api";
import MultiEpisode from "./views/multi-episode";

class NavBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      episode: MultiEpisode.getEpisodeFromPathname(window.location.pathname),
    };
  }

  toggleNavigation() {
    window.click_toggle();
  }

  render() {
    return (
      <nav className="navbar navbar-default navbar-fixed">
        <div className="container-fluid">
          <div className="navbar-header">
            {/* The hamburger button used on small screens */}
            <button
              type="button"
              onClick={this.toggleNavigation}
              className="navbar-toggle"
              data-toggle="collapse"
              data-target="#navigation-example-2"
            >
              <span className="sr-only">Toggle navigation</span>
              <span className="icon-bar" />
              <span className="icon-bar" />
              <span className="icon-bar" />
            </button>
            <NavLink className="navbar-brand" to={`/home`}>
              Battlecode {this.state.episode}
            </NavLink>
          </div>
          <div className="collapse navbar-collapse">
            <NavBarAccount />
          </div>
        </div>
      </nav>
    );
  }
}

class NavBarAccount extends Component {
  constructor() {
    super();
    // This is odd, see #93 for explanation
    this.state = { logged_in: null };
  }
  componentDidMount() {
    // duped in various places, see sidebar.js
    Api.loginCheck((logged_in) => {
      this.setState({ logged_in });
    });
  }

  render() {
    // This is odd, see #93 for explanation
    if (this.state.logged_in) {
      return (
        <ul className="nav navbar-nav navbar-right">
          <li>
            <NavLink to={`/account`}>Account</NavLink>
          </li>
          <li>
            <NavLink to={`/logout`}>Log out</NavLink>
          </li>
        </ul>
      );
    }
    if (this.state.logged_in === false) {
      return (
        <ul className="nav navbar-nav navbar-right">
          <li>
            <NavLink to={`/register`}>Register</NavLink>
          </li>
          <li>
            <NavLink to={`/login`}>Log in</NavLink>
          </li>
        </ul>
      );
    }
    // This is odd, see #93 for explanation
    return <ul />;
  }
}

export default NavBar;
