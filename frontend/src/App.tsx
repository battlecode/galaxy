import type React from "react";
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
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
} from "react-router-dom";
import { DEFAULT_EPISODE } from "./utils/constants";
import EpisodeNotFound from "./views/EpisodeNotFound";
import Rankings from "./views/Rankings";
import { CurrentUserProvider } from "./contexts/CurrentUserProvider";
import PrivateRoute from "./components/PrivateRoute";
import Queue from "./views/Queue";
import Resources from "./views/Resources";
import { EpisodeProvider } from "./contexts/EpisodeProvider";
import Scrimmaging from "./views/Scrimmaging";
import MyTeam from "./views/MyTeam";
import Tournaments from "./views/Tournaments";
import TournamentPage from "./views/Tournament";
import Submissions from "./views/Submissions";
import DebuggingTips from "./views/DebuggingTips";
import CommonIssues from "./views/CommonIssues";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { toast, Toaster } from "react-hot-toast";
import { ResponseError } from "./api/_autogen/runtime";
import { submissionsLoader } from "./api/loaders/submissionsLoader";
import { myTeamLoader } from "./api/loaders/myTeamLoader";
import { scrimmagingLoader } from "./api/loaders/scrimmagingLoader";
import { rankingsLoader } from "./api/loaders/rankingsLoader";
import { teamProfileLoader } from "./api/loaders/teamProfileLoader";
import { queueLoader } from "./api/loaders/queueLoader";
import { tournamentsLoader } from "./api/loaders/tournamentsLoader";
import { tournamentLoader } from "./api/loaders/tournamentLoader";
import { homeLoader } from "./api/loaders/homeLoader";
import ErrorBoundary from "./views/ErrorBoundary";
import PageNotFound from "views/PageNotFound";
import TeamProfile from "views/TeamProfile";
import { homeIfLoggedIn } from "api/loaders/homeIfLoggedIn";
import { episodeLoader } from "api/loaders/episodeLoader";
import UserProfile from "views/UserProfile";
import { userProfileLoader } from "api/loaders/userProfileLoader";
import { HttpStatusCode } from "api/apiTypes";
import { accountLoader } from "api/loaders/accountLoader";
import CodeOfConduct from "views/CodeOfConduct";
import Client from "views/Client";
import AdminTournament from "views/AdminTournament";
import { adminTournamentLoader } from "api/loaders/adminTournamentLoader";

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      if (error instanceof ResponseError) {
        // TODO: add special handling for 403 email verification erros
        // If we just have a client error, don't show a toast
        if (error.response.status < HttpStatusCode.INTERNAL_SERVER_ERROR)
          return;
      }
      // Otherwise, show the user a failure message
      toast.error(`Something went wrong: ${error.message}`);
    },
  }),
});

queryClient.setQueryDefaults(["episode"], {
  retry: 1,
});
queryClient.setQueryDefaults(["team"], { retry: false });
queryClient.setQueryDefaults(["user"], { retry: false });

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <Toaster position="top-center" reverseOrder={false} />
    <CurrentUserProvider>
      <EpisodeProvider>
        <RouterProvider router={router} />
      </EpisodeProvider>
    </CurrentUserProvider>
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
);

const router = createBrowserRouter([
  // Pages that should render without a sidebar/navbar
  {
    path: "/login",
    element: <Login />,
    errorElement: <ErrorBoundary />,
    loader: homeIfLoggedIn(queryClient),
  },
  { path: "/logout", element: <Logout />, errorElement: <ErrorBoundary /> },
  {
    path: "/register",
    element: <Register />,
    errorElement: <ErrorBoundary />,
    loader: homeIfLoggedIn(queryClient),
  },
  {
    path: "/password_forgot",
    element: <PasswordForgot />,
    errorElement: <ErrorBoundary />,
    loader: homeIfLoggedIn(queryClient),
  },
  {
    path: "/password_change",
    element: <PasswordChange />,
    errorElement: <ErrorBoundary />,
  },
  // Account page doesn't have episode id in URL
  {
    element: <EpisodeLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        element: <PrivateRoute />,
        children: [
          {
            path: "/account",
            element: <Account />,
            loader: accountLoader(queryClient),
          },
        ],
      },
      {
        path: "user/:userId",
        element: <UserProfile />,
        loader: userProfileLoader(queryClient),
      },
    ],
  },
  // Pages that will contain the episode sidebar and navbar (excl. account page)
  {
    element: <EpisodeLayout />,
    errorElement: <EpisodeNotFound />,
    path: "/:episodeId",
    loader: episodeLoader(queryClient),
    children: [
      {
        // Pages that should only be visible when logged in
        element: <PrivateRoute />,
        errorElement: <ErrorBoundary />,
        children: [
          {
            path: "submissions",
            element: <Submissions />,
            loader: submissionsLoader(queryClient),
          },
          {
            path: "my_team",
            element: <MyTeam />,
            loader: myTeamLoader(queryClient),
          },
          {
            path: "scrimmaging",
            element: <Scrimmaging />,
            loader: scrimmagingLoader(queryClient),
          },
          {
            path: "client",
            element: <Client />,
          },
        ],
      },
      // Pages that should always be visible
      {
        path: "",
        element: <Home />,
        loader: homeLoader(queryClient),
        errorElement: <ErrorBoundary />,
      },
      {
        path: "home",
        element: <Home />,
        loader: homeLoader(queryClient),
        errorElement: <ErrorBoundary />,
      },
      {
        path: "resources",
        element: <Resources />,
        errorElement: <ErrorBoundary />,
      },
      {
        path: "quick_start",
        element: <QuickStart />,
        errorElement: <ErrorBoundary />,
      },
      {
        path: "code_of_conduct",
        element: <CodeOfConduct />,
        errorElement: <ErrorBoundary />,
      },
      {
        path: "rankings",
        element: <Rankings />,
        loader: rankingsLoader(queryClient),
        errorElement: <ErrorBoundary />,
      },
      {
        path: "queue",
        element: <Queue />,
        loader: queueLoader(queryClient),
        errorElement: <ErrorBoundary />,
      },
      {
        path: "tournaments",
        element: <Tournaments />,
        loader: tournamentsLoader(queryClient),
        errorElement: <ErrorBoundary />,
      },
      {
        path: "tournament/:tournamentId",
        element: <TournamentPage />,
        loader: tournamentLoader(queryClient),
        errorElement: <ErrorBoundary />,
      },
      {
        path: "tournament/:tournamentId/admin",
        element: <AdminTournament />,
        errorElement: <ErrorBoundary />,
        loader: adminTournamentLoader(queryClient),
      },
      {
        path: "team/:teamId",
        element: <TeamProfile />,
        loader: teamProfileLoader(queryClient),
        errorElement: <ErrorBoundary />,
      },
      {
        path: "debugging_tips",
        element: <DebuggingTips />,
        errorElement: <ErrorBoundary />,
      },
      {
        path: "common_issues",
        element: <CommonIssues />,
        errorElement: <ErrorBoundary />,
      },
      {
        path: "*",
        element: <PageNotFound />,
      },
    ],
  },
  {
    path: "/",
    element: <Navigate to={`/${DEFAULT_EPISODE}/home`} />,
    errorElement: <ErrorBoundary />,
  },
]);

export default App;
