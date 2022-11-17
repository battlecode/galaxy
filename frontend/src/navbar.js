import React, { Component } from "react";
import { NavLink } from "react-router-dom";

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
              to={`/${this.props.episode}/home`}
            >
              {this.props.episode_name_long}
            </NavLink>
          </div>
          <div className="collapse navbar-collapse">
            <NavBarAccount
              logged_in={this.props.logged_in}
              episode={this.props.episode}
            />
          </div>
        </div>
      </nav>
    );
  }
}

class NavBarAccount extends Component {
  render() {
    // This is odd, see #93 for explanation
    if (this.props.logged_in) {
      return (
        <ul className="nav navbar-nav navbar-right">
          <li>
            <NavLink to={`/multi-episode`}>Change Episode</NavLink>
          </li>
          <li>
            <NavLink to={`/${this.props.episode}/account`}>Account</NavLink>
          </li>
          <li>
            <NavLink to={`/logout`}>Log out</NavLink>
          </li>
        </ul>
      );
    }
    if (this.props.logged_in === false) {
      return (
        <ul className="nav navbar-nav navbar-right">
          <li>
            <NavLink to={`/multi-episode`}>Change Episode</NavLink>
          </li>
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
