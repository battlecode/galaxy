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

import Spinner from "./components/spinner";

class App extends Component {
  constructor() {
    super();
    const episode = MultiEpisode.getEpisodeFromCurrentPathname(false);
    this.state = {
      logged_in: null,
      episode: episode,
      episode_info: null,
      user: null,
      team: null,
      loaded: false,
    };

    // Sets the login header based on currently held cookies, before any
    // requests are run.
    Api.setLoginHeader();
  }

  updateBaseState = (callback = () => {}) => {
    let fetched_logged_in, fetched_user, fetched_team, fetched_episode_info;

    const ajax1 = Api.loginCheck((logged_in) => {
      fetched_logged_in = logged_in;
    });

    const ajax2 = Api.getUserProfile((user) => {
      fetched_user = user;
    });

    const ajax3 = Api.getUserTeamProfile(this.state.episode, (team) => {
      fetched_team = team;
    });

    const ajax4 = Api.getEpisodeInfo(this.state.episode, (episode_info) => {
      fetched_episode_info = episode_info;
    });

    const ajax_queries = [ajax1, ajax2, ajax3, ajax4];

    // To be run when all AJAX queries are complete.
    const all_queries_finished = () => {
      this.setState({
        loaded: true,
        logged_in: fetched_logged_in,
        user: fetched_user,
        team: fetched_team,
        episode_info: fetched_episode_info,
      });
    };

    // Modify each AJAX query to mark as completed, and run all queries finished logic when all completed.
    let completed_queries = 0;
    let mark_completed = () => {
      completed_queries++;
      if (completed_queries == ajax_queries.length) all_queries_finished();
    };
    ajax_queries.map((ajax) => ajax.done(mark_completed).fail(mark_completed));
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
    // in case user hasn't been set yet.
    const is_staff = this.state.user && this.state.user.is_staff;

    const on_team = this.state.team !== null;

    const is_game_released =
      is_staff ||
      (this.state.episode_info &&
        new Date() > new Date(this.state.episode_info.game_release));

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

      // commented but kept since we might use this later
      // <Route path={`/:episode/updates`} component={Updates} key="updates" />,
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
            episode_name_long={episode_name_long}
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
            team={this.state.team}
            episode={this.state.episode}
            episode_info={this.state.episode_info}
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
            user={this.state.user}
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

    // No staff-only views yet
    this.staffElems = [];

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
    let onTeamAndGameReleasedElemsToRender =
      on_team && is_game_released ? this.onTeamAndGameReleasedElems : [];
    let staffElemsToRender = is_staff ? this.staffElems : [];

    let elemsToRender = this.nonLoggedInElems.concat(
      loggedInElemsToRender,
      onTeamAndGameReleasedElemsToRender,
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
              {this.state.loaded && <Switch>{elemsToRender}</Switch>}
              {!this.state.loaded && <Spinner />}
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
