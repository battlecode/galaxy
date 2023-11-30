import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import EpisodeLayout from "./components/EpisodeLayout";
import Home from "./views/Home";
import Logout from "./views/Logout";
import Register from "./views/Register";
import PasswordForgot from "./views/PasswordForgot";
import PasswordChange from "./views/PasswordChange";
import Account from "./views/Account";
import Login from "./views/Login";
import QuickStart from "./views/QuickStart";
import {
  RouterProvider,
  createBrowserRouter,
  Navigate,
  redirect,
} from "react-router-dom";
import { DEFAULT_EPISODE } from "./utils/constants";
import NotFound from "./views/NotFound";
import Rankings from "./views/Rankings";
import { CurrentUserProvider } from "./components/CurrentUserProvider";
import PrivateRoute from "./components/PrivateRoute";
import Queue from "./views/Queue";
import Resources from "./views/Resources";
import { CurrentTeamProvider } from "./contexts/CurrentTeamProvider";
import { EpisodeProvider } from "./contexts/EpisodeProvider";
import Scrimmaging from "./views/Scrimmaging";
import MyTeam from "./views/MyTeam";
import Tournaments from "./views/Tournaments";
import TournamentPage from "./views/Tournament";
import Submissions from "./views/Submissions";

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <CurrentUserProvider>
        <EpisodeProvider>
          <CurrentTeamProvider>
            <RouterProvider router={router} />
          </CurrentTeamProvider>
        </EpisodeProvider>
      </CurrentUserProvider>
    </QueryClientProvider>
  );
};

const router = createBrowserRouter([
  // Pages that should render without a sidebar/navbar
  { path: "/login", element: <Login /> },
  { path: "/logout", element: <Logout /> },
  { path: "/register", element: <Register /> },
  { path: "/password_forgot", element: <PasswordForgot /> },
  { path: "/password_change", element: <PasswordChange /> },
  // Pages that should only be visible when logged in
  {
    element: <PrivateRoute />,
    children: [
      {
        element: <EpisodeLayout />,
        children: [
          {
            path: "/:episodeId/submissions",
            element: <Submissions />,
          },
          {
            path: "/:episodeId/team",
            element: <MyTeam />,
          },
          { path: "/:episodeId/scrimmaging", element: <Scrimmaging /> },
          { path: "/account", element: <Account /> },
        ],
      },
    ],
  },
  // Pages that will contain the episode specific sidebar and navbar
  {
    element: <EpisodeLayout />,
    children: [
      // Pages that should always be visible
      { path: "/:episodeId/resources", element: <Resources /> },
      { path: "/:episodeId/quickstart", element: <QuickStart /> },
      { path: "/:episodeId/home", element: <Home /> },
      {
        path: "/:episodeId/",
        loader: ({ params }) => {
          return redirect(`/${params.episodeId as string}/home`);
        },
      },
      { path: "/:episodeId/*", element: <NotFound /> },
      { path: "/:episodeId/rankings", element: <Rankings /> },
      { path: "/:episodeId/queue", element: <Queue /> },
      { path: "/:episodeId/tournaments", element: <Tournaments /> },
      {
        path: "/:episodeId/tournament/:tournamentId",
        element: <TournamentPage />,
      },
    ],
  },
  // Pages that should redirect
  { path: "/*", element: <Navigate to={`/${DEFAULT_EPISODE}/home`} /> },
]);

export default App;
