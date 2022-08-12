import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import Api from "./api";

class NavBar extends Component {
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
            <NavLink
              className="navbar-brand"
              to={`${process.env.PUBLIC_URL}/home`}
            >
              Battlecode 2022
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
    this.state = { logged_in: null };
  }
  componentDidMount() {
    // duped in various places, see sidebar.js
    Api.loginCheck((logged_in) => {
      this.setState({ logged_in });
    });
  }

  render() {
    if (this.state.logged_in) {
      return (
        <ul className="nav navbar-nav navbar-right">
          <li>
            <NavLink to={`${process.env.PUBLIC_URL}/account`}>Account</NavLink>
          </li>
          <li>
            <NavLink to={`${process.env.PUBLIC_URL}/logout`}>Log out</NavLink>
          </li>
        </ul>
      );
    }
    if (this.state.logged_in === false) {
      return (
        <ul className="nav navbar-nav navbar-right">
          <li>
            <NavLink to={`${process.env.PUBLIC_URL}/register`}>
              Register
            </NavLink>
          </li>
          <li>
            <NavLink to={`${process.env.PUBLIC_URL}/login`}>Log in</NavLink>
          </li>
        </ul>
      );
    }
    return <ul />;
  }
}

export default NavBar;
