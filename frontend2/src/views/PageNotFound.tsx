import React from "react";
import { NavLink } from "react-router-dom";
import { DEFAULT_EPISODE } from "utils/constants";

const PageNotFound: React.FC = () => {
  return (
    <div className="flex h-full w-full flex-col overflow-auto p-6">
      <p>
        That page was not found.{" "}
        <NavLink to={`/${DEFAULT_EPISODE}/home`} className="hover:underline">
          Go Home?
        </NavLink>
      </p>
    </div>
  );
};

export default PageNotFound;
