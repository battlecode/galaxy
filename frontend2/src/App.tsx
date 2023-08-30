import React, { useState } from "react";
import EpisodeLayout from "./components/EpisodeLayout";
import Home from "./views/Home";
import Logout from "./views/Logout";
import Register from "./views/Register";
import PasswordForgot from "./views/PasswordForgot";
import PasswordChange from "./views/PasswordChange";
import Account from "./views/Account";
import Login from "./views/Login";
import QuickStart from "./views/QuickStart";
import { EpisodeContext } from "./contexts/EpisodeContext";
import {
  RouterProvider,
  createBrowserRouter,
  Navigate,
} from "react-router-dom";
import { DEFAULT_EPISODE } from "./utils/constants";
import NotFound from "./views/NotFound";
import Rankings from "./views/Rankings";
import { CurrentUserProvider } from "./components/CurrentUserProvider";
import PrivateRoute from "./components/PrivateRoute";
import Queue from "./views/Queue";

const App: React.FC = () => {
  const [episodeId, setEpisodeId] = useState(DEFAULT_EPISODE);
  return (
    <CurrentUserProvider>
      <EpisodeContext.Provider value={{ episodeId, setEpisodeId }}>
        <RouterProvider router={router} />
      </EpisodeContext.Provider>
    </CurrentUserProvider>
  );
};

const router = createBrowserRouter([
  // Pages that should render without a sidebar/navbar
  { path: "/login", element: <Login /> },
  { path: "/logout", element: <Logout /> },
  { path: "/register", element: <Register /> },
  { path: "/password_forgot", element: <PasswordForgot /> },
  { path: "/password_change", element: <PasswordChange /> },
  // Pages that will contain the episode specific sidebar and navbar
  {
    element: <EpisodeLayout />,
    children: [
      // Pages that should always be visible
      // TODO: /:episodeId/resources, /:episodeId/tournaments, /:episodeId/queue
      { path: "/:episodeId/home", element: <Home /> },
      { path: "/:episodeId/quickstart", element: <QuickStart /> },
      { path: "/:episodeId/*", element: <NotFound /> },
      { path: "/:episodeId/rankings", element: <Rankings /> },
    ],
  },
  // Pages that should only be visible when logged in
  {
    element: <PrivateRoute />,
    children: [
      {
        element: <EpisodeLayout />,
        children: [
          // TODO: /:episodeId/team, /:episodeId/submissions, /:episodeId/scrimmaging
          { path: "/:episodeId/queue", element: <Queue /> },
        ],
      },
      { path: "/account", element: <Account /> },
    ],
  },
  // Pages that should redirect
  { path: "/*", element: <Navigate to={`/${DEFAULT_EPISODE}/home`} /> },
]);

export default App;
