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
    const episode = MultiEpisode.getEpisodeFromCurrentPathname(false);
    this.state = {
      logged_in: null,
      episode: episode,
      episode_info: null,
      user_profile: null,
      team_profile: null,
    };

    // Sets the login header based on currently held cookies, before any
    // requests are run.
    Api.setLoginHeader();
  }

  updateBaseState = (callback = () => {}) => {
    const ajax1 = Api.loginCheck((logged_in) => {
      this.setState({ logged_in });
    });

    const ajax2 = Api.getUserProfile((user_profile) => {
      this.setState({ user_profile });
    });

    const ajax3 = Api.getUserTeamProfile(this.state.episode, (team_profile) => {
      this.setState({ team_profile });
    });

    const ajax4 = Api.getEpisodeInfo(this.state.episode, (episode_info) => {
      this.setState({ episode_info });
    });

    // Run this function when all AJAX queries are completed.
    // See https://stackoverflow.com/a/9865124.
    $.when(ajax1, ajax2, ajax3, ajax4).done(callback).fail(callback);
  };

  componentDidMount() {
    this.updateBaseState(() => {
      // This function, for mobile devices, moves the navbar into the sidebar and then
      // collapses the sidebar. Better responsive display
      // (Only call it when the entire DOM has fully loaded, since otherwise,
      // the _incomplete_ navbar gets moved and is stuck there.)
      // See `light-bootstrap-dashboard.js`, and its `initRightMenu` method
      $(document).ready(function () {
        window.init_right_menu();
      });
    });
  }

  render() {
    // Note that `Route`s define what routes a user may access / what routes exist to a user.
    // Does _NOT_ actually render a clickable link to that route.
    // That is done in navbar.js, sidebar.js, footer.js, etc

    // Short-circuit check for nested object,
    // in case user_profile hasn't been set yet.
    const is_staff =
      this.state.user_profile && this.state.user_profile.user.is_staff;

    const on_team = this.state.team_profile !== null;

    const is_game_released =
      this.props.is_staff ||
      (this.props.episode_info &&
        new Date() > new Date(this.props.episode_info.game_release));

    const episode_name_long = this.state.episode_info
      ? this.state.episode_info.name_long
      : null;

    // should always be viewable, even when not logged in
    this.nonLoggedInElems = [
      // Redirect empty path to the default episode's home page
      // NOTE: this path needs a slash, it can't be the empty string. Unsure why.
      <Route exact path="/" key="empty-route">
        {<Redirect to={`${MultiEpisode.getDefaultEpisode()}/home`} />}
      </Route>,

      <Route
        path={`/:episode/home`}
        component={(props) => (
          <Home
            {...props}
            on_team={on_team}
            episode_name_long={episode_name_long}
          />
        )}
        key="home"
      />,

      // <Route path={`/:episode/updates`} component={Updates} key="updates" />,

      // commented but kept since we might use this later
      // <Route path={`/search`} component={Search} key="search" />,
      <Route
        path={`/:episode/tournaments`}
        component={(props) => (
          <Tournaments
            {...props}
            episode_name_long={episode_name_long}
            episode={this.state.episode}
          />
        )}
        key="tournaments"
      />,
      <Route
        path={`/:episode/getting-started`}
        component={(props) => (
          <GettingStarted
            {...props}
            episode_name_long={episode_name_long}
            episode={this.state.episode}
          />
        )}
        key="getting-started"
      />,
      <Route
        path={`/:episode/common-issues`}
        component={(props) => (
          <Issues {...props} episode={this.state.episode} />
        )}
        key="issues"
      />,
      <Route
        path={`/:episode/debugging-tips`}
        component={(props) => (
          <Issues {...props} episode={this.state.episode} />
        )}
        key="debugging"
      />,
      <Route
        path={`/:episode/codeofconduct`}
        component={CodeOfConduct}
        key="codeofconduct"
      />,
      <Route
        path={`/:episode/resources`}
        component={(props) => (
          <Resources
            {...props}
            episode_info={this.state.episode_info}
            episode={this.state.episode}
            is_game_released={is_game_released}
          />
        )}
        key="resources"
      />,
      // <Route
      //   path={`/:episode/rankings/:team_id`}
      //   component={TeamInfo}
      //   key="rankings-team"
      // />,
      // <Route path={`/:episode/rankings`} component={Rankings} key="rankings" />,
    ];

    // should only be visible to logged in users
    // If user is not logged-in, should 404 and not even render
    this.loggedInElems = [
      <Route
        path={`/:episode/team`}
        component={(props) => (
          <Team
            {...props}
            team_profile={this.state.team_profile}
            episode={this.state.episode}
            updateBaseState={this.updateBaseState}
          />
        )}
        key="team"
      />,
      <Route
        path={`/:episode/account`}
        component={(props) => (
          <Account
            {...props}
            user_profile={this.state.user_profile}
            updateBaseState={this.updateBaseState}
          />
        )}
        key="account"
      />,
    ];

    // Should only be visible and renderable to users on a team
    this.onTeamAndGameReleasedElems = [
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
      // Once upon a time, this redirected. This turned out not to work.
      // For example, what happens if the requested route seems inaccessible now,
      // just because login-check hasn't finished running?
      // We need to make sure that login-check, etc, properly run first.
      <Route path="*" component={NotFound} key="notfound" />,
    ];
    // Note that the "toRender" arrays are computed during the render method
    // This is important! Checking whether the user is logged-in, etc,
    // takes an API call, which takes time.
    // Whenever this API call finishes, we should always be ready to re-include the routes,
    // and thus potentially re-render the URL that the user is looking to navigate to.

    let loggedInElemsToRender = this.state.logged_in ? this.loggedInElems : [];
    let onTeamElemsToRender =
      on_team && is_game_released ? this.onTeamElems : [];
    let staffElemsToRender =
      this.state.user_profile && this.state.user_profile.user.is_staff
        ? this.staffElems
        : [];

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
        {/* Some pages, eg login and register, should not render alongside sidebar, navbar, etc
        So they have their own routes, and so only their own component will be rendered
        All other pages should render alongside sidebar, navbar, etc
        (and so their corresponding routes are all in the fallback route's switch,
        and this fallback route includes a sidebar, etc) */}
        <Route path={`/login`} component={LoginRegister} />,
        <Route path={`/logout`} component={LogOut} />,
        <Route path={`/register`} component={Register} />,
        <Route path={`/multi-episode`} component={MultiEpisode} />,
        <Route path={`/password_forgot`} component={PasswordForgot} />,
        <Route path={`/password_change`} component={PasswordChange} />,
        {/* To be able to render NotFound without a sidebar, etc */}
        <Route path={`/not-found`} component={NotFound} />,
        {/* Fallback route if none of above: include sidebar, navbar, etc. */}
        <Route>
          <div className="wrapper">
            <SideBar
              logged_in={this.state.logged_in}
              is_staff={is_staff}
              on_team={on_team}
              episode={this.state.episode}
              episode_info={this.state.episode_info}
              episode_name_long={episode_name_long}
              is_game_released={is_game_released}
            />
            <div className="main-panel">
              <NavBar
                logged_in={this.state.logged_in}
                episode={this.state.episode}
                episode_name_long={episode_name_long}
              />
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
