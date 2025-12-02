import type React from "react";
import { Link } from "react-router-dom";
import { DEFAULT_EPISODE } from "utils/constants";
import { PageContainer } from "components/elements/BattlecodeStyle";

const EpisodeNotFound: React.FC = () => (
  <PageContainer>
    <p>
      That episode was not found.{" "}
      <Link to={`/${DEFAULT_EPISODE}/home`} className="hover:underline">
        Go Home?
      </Link>
    </p>
  </PageContainer>
);

export default EpisodeNotFound;
