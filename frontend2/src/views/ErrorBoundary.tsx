import React from "react";
import { useRouteError } from "react-router-dom";
import { PageTitle } from "../components/elements/BattlecodeStyle";

const ErrorBoundary: React.FC = () => {
  const error = useRouteError();

  if (error instanceof Error) {
    return (
      <div className="flex flex-col gap-6 p-6 xl:flex-row">
        <PageTitle>Oops, something went wrong.</PageTitle>
        <p>
          Please reach out on Discord or to battlecode@mit.edu with the
          following error message:
        </p>
        <span className="rounded-md bg-gray-200 px-1 py-0.5 font-mono">
          {error.message}
        </span>
      </div>
    );
  }

  return <p>Oops, something went wrong.</p>;
};

export default ErrorBoundary;
