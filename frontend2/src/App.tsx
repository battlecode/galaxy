import React from "react";
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
  type LoaderFunction,
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
import { loginCheck } from "./api/auth/authApi";
import { submissionsLoader } from "./api/loaders/submissionsLoader";
import { myTeamLoader } from "./api/loaders/myTeamLoader";
import { scrimmagingLoader } from "./api/loaders/scrimmagingLoader";
import { rankingsLoader } from "./api/loaders/rankingsLoader";
import { teamProfileLoader } from "./api/loaders/teamProfileLoader";
import { episodeInfoFactory } from "./api/episode/episodeFactories";
import { buildKey } from "./api/helpers";
import { queueLoader } from "./api/loaders/queueLoader";
import { tournamentsLoader } from "./api/loaders/tournamentsLoader";
import { tournamentLoader } from "./api/loaders/tournamentLoader";
import { homeLoader } from "./api/loaders/homeLoader";
import ErrorBoundary from "./views/ErrorBoundary";
import { myTeamFactory, searchTeamsFactory } from "api/team/teamFactories";
import PageNotFound from "views/PageNotFound";
import TeamProfile from "views/TeamProfile";
import { passwordForgotLoader } from "api/loaders/passwordForgotLoader";

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      if (error instanceof ResponseError) {
        // If we just have a client error, don't show a toast
        if (error.response.status < 500) return;
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

// Run a check to see if the user has an invalid token
const loggedIn = await loginCheck(queryClient);

const App: React.FC = () => {
  return (
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
};

const episodeLoader: LoaderFunction = async ({ params }) => {
  // check if the episodeId is a valid one.
  // if the episode is not found, throw an error.
  const id = params.episodeId ?? "";
  if (id === "") {
    throw new ResponseError(
      new Response("Episode not found.", { status: 404 }),
    );
  }

  // Await the episode info so we can be sure that it exists.
  const episodeInfo = await queryClient.ensureQueryData({
    queryKey: buildKey(episodeInfoFactory.queryKey, { id }),
    queryFn: async () => await episodeInfoFactory.queryFn({ id }),
    staleTime: Infinity,
  });

  // Prefetch the top 10 ranked teams' rating histories.
  void queryClient.ensureQueryData({
    queryKey: buildKey(searchTeamsFactory.queryKey, {
      episodeId: id,
      page: 1,
    }),
    queryFn: async () =>
      await searchTeamsFactory.queryFn(
        { episodeId: id, page: 1 },
        queryClient,
        false, // We don't want to prefetch teams 11-20
      ),
  });

  // Prefetch the user's team.
  if (loggedIn) {
    void queryClient.ensureQueryData({
      queryKey: buildKey(myTeamFactory.queryKey, { episodeId: id }),
      queryFn: async () => await myTeamFactory.queryFn({ episodeId: id }),
    });
  }

  return episodeInfo;
};

const router = createBrowserRouter([
  // Pages that should render without a sidebar/navbar
  { path: "/login", element: <Login />, errorElement: <ErrorBoundary /> },
  { path: "/logout", element: <Logout />, errorElement: <ErrorBoundary /> },
  { path: "/register", element: <Register />, errorElement: <ErrorBoundary /> },
  {
    path: "/password_forgot",
    element: <PasswordForgot />,
    errorElement: <ErrorBoundary />,
    loader: passwordForgotLoader(queryClient),
  },
  {
    path: "/password_change",
    element: <PasswordChange />,
    errorElement: <ErrorBoundary />,
  },
  // Account page doesn't have episode id in URL
  {
    element: <PrivateRoute />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        element: <EpisodeLayout />,
        children: [{ path: "/account", element: <Account /> }],
      },
    ],
  },
  // Pages that will contain the episode sidebar and navbar (excl. account page)
  {
    element: <EpisodeLayout />,
    errorElement: <EpisodeNotFound />,
    path: "/:episodeId",
    loader: episodeLoader,
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
        ],
      },
      { path: "debuggingtips", element: <DebuggingTips /> },
      { path: "commonissues", element: <CommonIssues /> },
      // Pages that should always be visible
      {
        path: "",
        element: <Home />,
        loader: homeLoader(queryClient),
      },
      {
        path: "home",
        element: <Home />,
        loader: homeLoader(queryClient),
      },
      { path: "resources", element: <Resources /> },
      { path: "quickstart", element: <QuickStart /> },
      {
        path: "rankings",
        element: <Rankings />,
        loader: rankingsLoader(queryClient),
      },
      {
        path: "queue",
        element: <Queue />,
        loader: queueLoader(queryClient),
      },
      {
        path: "tournaments",
        element: <Tournaments />,
        loader: tournamentsLoader(queryClient),
      },
      {
        path: "tournament/:tournamentId",
        element: <TournamentPage />,
        loader: tournamentLoader(queryClient),
      },
      {
        path: "team/:teamId",
        element: <TeamProfile />,
        loader: teamProfileLoader(queryClient),
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
