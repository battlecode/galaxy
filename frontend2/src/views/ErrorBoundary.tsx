import React from "react";
import { useRouteError, Link } from "react-router-dom";
import { PageTitle } from "../components/elements/BattlecodeStyle";
import { useEpisodeId } from "../contexts/EpisodeContext";

const ErrorBoundary: React.FC = () => {
  const error = useRouteError();
  const { episodeId } = useEpisodeId();

  return (
    <div className="flex h-screen w-full items-center justify-center bg-white p-6">
      <div className="flex w-full max-w-xs flex-col gap-4 rounded-lg border border-gray-300 bg-gray-50 p-6 shadow-md">
        <PageTitle>Oops, something went wrong.</PageTitle>
        <p className="text-center">
          Please reach out on Discord or to battlecode@mit.edu with the
          following error message:
        </p>
        {error instanceof Error ? (
          <span className="block rounded-md bg-gray-200 px-1 py-0.5 text-center font-mono">
            {error.message}
          </span>
        ) : (
          <span className="block text-center text-red-600">
            An unknown error occurred.
          </span>
        )}
        <Link to={episodeId !== undefined ? `/${episodeId}/home` : "/"}>
          <div className="mx-auto mt-4 rounded bg-blue-500 px-3 py-1 text-center text-white transition hover:bg-blue-600">
            Go to Home
          </div>
        </Link>
      </div>
    </div>
  );
};

export default ErrorBoundary;
