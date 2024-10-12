import React from "react";
import { NavLink } from "react-router-dom";
import { DEFAULT_EPISODE } from "utils/constants";

const NoContentLegacyEpisode: React.FC = () => {
  return (
    <div className="flex h-full w-full flex-col overflow-auto p-6">
      <p>
        {`If you don't see any content here, don't worry!
      This is a legacy episode, so there may not be any information for this page.`}{" "}
        <NavLink to={`/${DEFAULT_EPISODE}/home`} className="hover:underline">
          Go to the latest episode?
        </NavLink>
      </p>
    </div>
  );
};

export default NoContentLegacyEpisode;
