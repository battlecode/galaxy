import type React from "react";

const NoContentFound: React.FC = () => (
  <div className="flex h-full w-full flex-col overflow-auto p-6">
    <p>
      {`No content found for this episode. If you have any questions, please `}
      <a href="mailto:battlecode.mit.edu" className="hover:underline">
        {`reach out to Battlecode staff`}
      </a>
      {". "}
    </p>
  </div>
);

export default NoContentFound;
