import React from "react";
import DocumentationPage from "../components/DocumentationPage";
import {
  quickStartText,
  defaultQuickStartText,
} from "../content/ManageContent";

import { useEpisodeId } from "../contexts/EpisodeContext";

const QuickStart: React.FC = () => {
  const { episodeId } = useEpisodeId();

  return (
    <DocumentationPage
      text={quickStartText[episodeId] ?? defaultQuickStartText}
    />
  );
};

export default QuickStart;
