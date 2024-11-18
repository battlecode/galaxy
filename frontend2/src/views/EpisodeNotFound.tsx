import type React from "react";
import { Link } from "react-router-dom";
import { DEFAULT_EPISODE } from "utils/constants";

const EpisodeNotFound: React.FC = () => (
  <div className="flex h-full w-full flex-col overflow-auto p-6">
    <p>
      That episode was not found.{" "}
      <Link to={`/${DEFAULT_EPISODE}/home`} className="hover:underline">
        Go Home?
      </Link>
    </p>
  </div>
);

export default EpisodeNotFound;
