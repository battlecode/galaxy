import React from "react";
import {
  defaultCommonIssuesText,
  commonIssuesText,
} from "../content/ManageContent";
import DocumentationPage from "../components/DocumentationPage";
import { useEpisodeId } from "../contexts/EpisodeContext";

const DebuggingTips = (): JSX.Element => {
  const { episodeId } = useEpisodeId();

  return (
    <DocumentationPage
      text={commonIssuesText[episodeId] ?? defaultCommonIssuesText}
    />
  );
};

export default DebuggingTips;
