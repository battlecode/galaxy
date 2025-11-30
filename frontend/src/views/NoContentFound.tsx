import type React from "react";
import { PageContainer } from "components/elements/BattlecodeStyle";

const NoContentFound: React.FC = () => (
  <PageContainer>
    <p>
      {`No content found for this episode. If you have any questions, please reach out to Battlecode staff at `}
      <a href="mailto:battlecode@mit.edu" className="hover:underline">
        {`battlecode@mit.edu`}
      </a>{" "}
    </p>
  </PageContainer>
);

export default NoContentFound;
