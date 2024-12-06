import type React from "react";

const NoContentFound: React.FC = () => (
  <div className="flex h-full w-full flex-col overflow-auto p-6">
    <p>
      {`No content found for this episode. If you have any questions, please reach out to Battlecode staff at `}
      <a href="mailto:battlecode@mit.edu" className="hover:underline">
        {`battlecode@mit.edu`}
      </a>
      {". "}
    </p>
  </div>
);

export default NoContentFound;
