import React from "react";
import { useRouteError, useNavigate } from "react-router-dom";
import { PageTitle } from "../components/elements/BattlecodeStyle";
import { DEFAULT_EPISODE } from "../utils/constants";

const ErrorBoundary: React.FC = () => {
  const error = useRouteError();
  const navigate = useNavigate(); // Initialize useNavigate

  const handleGoHome = (): void => {
    navigate(`/${DEFAULT_EPISODE}/home`); // Navigate to home
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-white p-6">
      <div className="flex flex-col gap-4 rounded-lg border border-gray-300 bg-gray-50 p-6 shadow-md max-w-xs w-full">
        <PageTitle>Oops, something went wrong.</PageTitle>
        <p className="text-center">
          Please reach out on Discord or to battlecode@mit.edu with the
          following error message:
        </p>
        {error instanceof Error ? (
          <span className="rounded-md bg-gray-200 px-1 py-0.5 font-mono text-center block">
            {error.message}
          </span>
        ) : (
          <span className="text-red-600 text-center block">An unknown error occurred.</span>
        )}
        <button
          onClick={handleGoHome}
          className="mt-4 rounded bg-blue-500 text-white px-3 py-1 hover:bg-blue-600 transition mx-auto"
        >
          Go to Home
        </button>
      </div>
    </div>
  );
};

export default ErrorBoundary;
