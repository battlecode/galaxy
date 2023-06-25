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

const App: React.FC = () => {
  const [episode, setEpisode] = useState(DEFAULT_EPISODE);
  return (
    <EpisodeContext.Provider value={{ episode, setEpisode }}>
      <RouterProvider router={router} />
    </EpisodeContext.Provider>
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
      // TODO: /:episode/resources, /:episode/tournaments, /:episode/rankings, /:episode/queue
      { path: "/:episode/home", element: <Home /> },
      { path: "/:episode/quickstart", element: <QuickStart /> },
      { path: "/:episode/*", element: <NotFound /> },
      // Pages that should only be visible when logged in
      // TODO: /:episode/team, /:episode/submissions, /:episode/scrimmaging
      { path: "/account", element: <Account /> },
      // etc
    ],
  },
  // Pages that should redirect
  { path: "/*", element: <Navigate to={`/${DEFAULT_EPISODE}/home`} /> },
]);

export default App;
