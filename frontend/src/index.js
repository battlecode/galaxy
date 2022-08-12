import React, { Component } from "react";
// import ReactDOM from "react-dom";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Switch, Route } from "react-router";

import Home from "./views/home";
import NotFound from "./views/not_found";
import GettingStarted from "./views/getting-started";
import Scrimmaging from "./views/scrimmaging";
import Tournaments from "./views/tournaments";
import Updates from "./views/updates";
import Search from "./views/search";
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
      <Route exact path={`${process.env.PUBLIC_URL}/`} component={Home} />,
      <Route path={`${process.env.PUBLIC_URL}/home`} component={Home} />,
      <Route path={`${process.env.PUBLIC_URL}/updates`} component={Updates} />,
      <Route path={`${process.env.PUBLIC_URL}/search`} component={Search} />,
      <Route
        path={`${process.env.PUBLIC_URL}/tournaments`}
        component={Tournaments}
      />,
      <Route
        path={`${process.env.PUBLIC_URL}/:year/getting-started`}
        component={GettingStarted}
      />,
      <Route
        path={`${process.env.PUBLIC_URL}/common-issues`}
        component={Issues}
      />,
      <Route
        path={`${process.env.PUBLIC_URL}/debugging`}
        component={Debugging}
      />,
      <Route
        path={`${process.env.PUBLIC_URL}/codeofconduct`}
        component={CodeOfConduct}
      />,
      <Route
        path={`${process.env.PUBLIC_URL}/resources`}
        component={Resources}
      />,
      <Route
        path={`${process.env.PUBLIC_URL}/rankings/:team_id`}
        component={TeamInfo}
      />,
      <Route
        path={`${process.env.PUBLIC_URL}/rankings`}
        component={Rankings}
      />,
      // Note that this route is visible to any user, even not logged in
      // This is fine for now since the staff page doesn't do anything
      // For access control without bloat, would be better to have a login check in the staff _component_,
      // _and an auth check in the backend for any methods that this page hits_
      // (this part is absolutely necessary regardless of frontend setup)
      <Route path={`${process.env.PUBLIC_URL}/staff`} component={Staff} />,
    ];

    // should only be visible to logged in users
    // If user is not logged-in, should 404 and not even render
    this.loggedInElems = [
      <Route path={`${process.env.PUBLIC_URL}/team`} component={Team} />,
      <Route path={`${process.env.PUBLIC_URL}/account`} component={Account} />,
      <Route
        path={`${process.env.PUBLIC_URL}/password_forgot`}
        component={PasswordForgot}
      />,
      <Route
        path={`${process.env.PUBLIC_URL}/password_change`}
        component={PasswordChange}
      />,
      // Note that this allows users to go to /scrimmaging or /submissions
      // by typing that in their URL bar, even if not clickable in the sidebar/navbar.
      // See #6, #13, #69 for issues where we make sure this is okay.
      <Route
        path={`${process.env.PUBLIC_URL}/scrimmaging`}
        component={Scrimmaging}
      />,
      <Route
        path={`${process.env.PUBLIC_URL}/submissions`}
        component={Submissions}
      />,
    ];

    // When in the list of routes, this route must be last.
    // (for wildcard to work properly)
    this.notFoundElems = [<Route path="*" component={NotFound} />];
  }

  componentDidMount() {
    // duped in various places, see sidebar.js
    Api.loginCheck((logged_in) => {
      this.setState({ logged_in });
    });
  }

  render() {
    let loggedInElemsToRender = this.state.logged_in ? this.loggedInElems : [];

    let elemsToRender = this.nonLoggedInElems.concat(
      loggedInElemsToRender,
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
        <Route
          path={`${process.env.PUBLIC_URL}/login`}
          component={LoginRegister}
        />
        ,
        <Route
          path={`${process.env.PUBLIC_URL}/register`}
          component={Register}
        />
        ,
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
