import type React from "react";
import { useRouteError, useNavigate } from "react-router-dom";
import { PageTitle } from "../components/elements/BattlecodeStyle";
import { useEpisodeId } from "../contexts/EpisodeContext";
import Button from "components/elements/Button";

const ErrorBoundary: React.FC = () => {
  const error = useRouteError();
  const { episodeId } = useEpisodeId();
  const navigate = useNavigate();

  return (
    <div className="flex h-full items-center justify-center bg-white p-6">
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
        <Button
          onClick={() => {
            navigate(`/${episodeId}/home`);
          }}
          label="Go to Home"
          variant="dark"
        />
      </div>
    </div>
  );
};

export default ErrorBoundary;
