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
import NotFound from "./views/NotFound";
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
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { toast, Toaster } from "react-hot-toast";
import { ResponseError } from "./api/_autogen/runtime";
import { episodeQueryKeys } from "./api/episode/episodeKeys";
import { getEpisodeInfo } from "./api/episode/episodeApi";
import { loginCheck } from "./api/auth/authApi";
import { submissionsLoader } from "./api/loaders/submissionsLoader";

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

queryClient.setQueryDefaults(["team"], { retry: false });
queryClient.setQueryDefaults(["user"], { retry: false });

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
  // Verify that the current token is valid first!
  await loginCheck(queryClient);
  // Now we can fetch the episode info.
  return await queryClient.fetchQuery({
    queryKey: episodeQueryKeys.info({ id }),
    queryFn: async () => await getEpisodeInfo({ id }),
    staleTime: Infinity,
  });
};

const router = createBrowserRouter([
  // Pages that should render without a sidebar/navbar
  { path: "/login", element: <Login /> },
  { path: "/logout", element: <Logout /> },
  { path: "/register", element: <Register /> },
  { path: "/password_forgot", element: <PasswordForgot /> },
  { path: "/password_change", element: <PasswordChange /> },
  // Account page doesn't have episode id in URL
  {
    element: <PrivateRoute />,
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
    path: "/:episodeId",
    loader: episodeLoader,
    errorElement: <NotFound />,
    children: [
      {
        // Pages that should only be visible when logged in
        element: <PrivateRoute />,
        children: [
          {
            path: "submissions",
            element: <Submissions />,
            loader: submissionsLoader(queryClient),
          },
          {
            path: "team",
            element: <MyTeam />,
          },
          {
            path: "scrimmaging",
            element: <Scrimmaging />,
          },
        ],
      },
      // Pages that should always be visible
      { path: "", element: <Home /> },
      { path: "home", element: <Home /> },
      { path: "resources", element: <Resources /> },
      { path: "quickstart", element: <QuickStart /> },
      { path: "rankings", element: <Rankings /> },
      { path: "queue", element: <Queue /> },
      { path: "tournaments", element: <Tournaments /> },
      {
        path: "tournament/:tournamentId",
        element: <TournamentPage />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
  { path: "/", element: <Navigate to={`/${DEFAULT_EPISODE}/home`} /> },
]);

export default App;
