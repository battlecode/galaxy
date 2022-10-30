import React, { Component } from "react";
// import ReactDOM from "react-dom";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Switch, Route, Redirect } from "react-router";

import Home from "./views/home";
import NotFound from "./views/not_found";
import GettingStarted from "./views/getting-started";
import Scrimmaging from "./views/scrimmaging";
import Tournaments from "./views/tournaments";
import Updates from "./views/updates";
// commented but kept since we might use this later
// import Search from "./views/search";
import Team from "./views/team";
import Issues from "./views/issues";
import Debugging from "./views/debugging";
import CodeOfConduct from "./views/codeofconduct";
import Staff from "./views/staff";
import Rankings from "./views/rankings";
import Account from "./views/account";
import Resources from "./views/resources";
import LoginRegister from "./views/login";
import Register from "./views/register";
// commented but kept since we might use this later
// import VerifyUser from "./views/VerifyUser";
import PasswordForgot from "./views/passwordForgot";
import PasswordChange from "./views/passwordChange";
import LogOut from "./views/logOut";
import MultiEpisode from "./views/multi-episode";
import Submissions from "./views/submissions";
import TeamInfo from "./views/teamInfo";
import Footer from "./footer";
import NavBar from "./navbar";
import SideBar from "./sidebar";
import Api from "./api";

class App extends Component {
  constructor() {
    super();
    this.state = { logged_in: null };

    // Note that `Route`s define what routes a user may access / what routes exist to a user.
    // Does _NOT_ actually render a clickable link to that route.
    // That is done in navbar.js, sidebar.js, footer.js, etc

    // should always be viewable, even when not logged in
    this.nonLoggedInElems = [
      // Redirect empty path to the default episode's home page
      // NOTE: this path needs a slash, it can't be the empty string. Unsure why.
      <Route exact path="/" key="empty-route">
        {<Redirect to={`${MultiEpisode.getDefaultEpisode()}/home`} />}
      </Route>,

      <Route path={`/:episode/home`} component={Home} key="home" />,
      <Route path={`/:episode/updates`} component={Updates} key="updates" />,
      // commented but kept since we might use this later
      // <Route path={`/search`} component={Search} key="search" />,
      <Route
        path={`/:episode/tournaments`}
        component={Tournaments}
        key="tournaments"
      />,
      <Route
        path={`/:episode/getting-started`}
        component={GettingStarted}
        key="getting-started"
      />,
      <Route
        path={`/:episode/common-issues`}
        component={Issues}
        key="issues"
      />,
      <Route
        path={`/:episode/debugging`}
        component={Debugging}
        key="debugging"
      />,
      <Route
        path={`/:episode/codeofconduct`}
        component={CodeOfConduct}
        key="codeofconduct"
      />,
      <Route
        path={`/:episode/resources`}
        component={Resources}
        key="resources"
      />,
      <Route
        path={`/:episode/rankings/:team_id`}
        component={TeamInfo}
        key="rankings-team"
      />,
      <Route path={`/:episode/rankings`} component={Rankings} key="rankings" />,
    ];

    // should only be visible to logged in users
    // If user is not logged-in, should 404 and not even render
    this.loggedInElems = [
      <Route path={`/:episode/team`} component={Team} key="team" />,
      <Route path={`/:episode/account`} component={Account} key="account" />,
      <Route
        path={`/password_change`}
        component={PasswordChange}
        key="password-change"
      />,
      <Route path={`/logout`} component={LogOut} key="logout" />,
    ];

    // Should only be visible and renderable to users on a team
    this.onTeamElems = [
      <Route
        path={`/:episode/scrimmaging`}
        component={Scrimmaging}
        key="scrimmaging"
      />,
      <Route
        path={`/:episode/submissions`}
        component={Submissions}
        key="submissions"
      />,
    ];

    this.staffElems = [
      // Make sure to have an auth check in the backend for any methods that this page hits_
      // (this part is absolutely necessary regardless of frontend setup)
      <Route path={`/:episode/staff`} component={Staff} key="staff" />,
    ];

    // When in the list of routes, this route must be last.
    // (for wildcard to work properly)
    this.notFoundElems = [
      <Route path="*" component={NotFound} key="notfound" />,
    ];
  }

  componentDidMount() {
    // duped in various places, see sidebar.js
    // This is messy and hard to understand, it will be cleaned in #91.
    Api.loginCheck((logged_in) => {
      this.setState({ logged_in });
    });

    Api.getUserProfile((user_profile) => {
      this.setState({ user: user_profile });
    });

    Api.getUserTeam((user_team_data) => {
      // This should be cleaned up in #91
      this.setState({ on_team: user_team_data !== null });
    });
  }

  render() {
    let loggedInElemsToRender = this.state.logged_in ? this.loggedInElems : [];
    let onTeamElemsToRender = this.state.on_team ? this.onTeamElems : [];
    let staffElemsToRender =
      this.state.user && this.state.user.is_staff ? this.staffElems : [];

    let elemsToRender = this.nonLoggedInElems.concat(
      loggedInElemsToRender,
      onTeamElemsToRender,
      staffElemsToRender,
      // notFoundElems must be last to work properly
      this.notFoundElems
    );

    // Note that the `Switch` element only contains routes.
    // So just like the routes, the `Switch`
    // only defines what routes a user may access / what routes exist to a user.
    // Does _NOT_ actually render a clickable link to that route.
    // That is done in navbar.js, sidebar.js, footer.js, etc

    return (
      <Switch>
        {/* Login and Register pages should not render with sidebar, navbar, etc */}
        {/* All other pages should (and so all other routes should allow this) */}
        <Route path={`/login`} component={LoginRegister} />,
        <Route path={`/register`} component={Register} />,
        <Route path={`/multi-episode`} component={MultiEpisode} />,
        <Route path={`/password_forgot`} component={PasswordForgot} />,
        <Route>
          <div className="wrapper">
            <SideBar />
            <div className="main-panel">
              <NavBar />
              <Switch>{elemsToRender}</Switch>
              <Footer />
            </div>
          </div>
        </Route>
      </Switch>
    );
  }
}

const container = document.getElementById("root");
const root = createRoot(container);
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
