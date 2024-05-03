import React from "react";
import {
  defaultDebuggingTipsText,
  debuggingTipsText,
} from "../content/ManageContent";
import DocumentationPage from "../components/DocumentationPage";
import { useEpisodeId } from "../contexts/EpisodeContext";

const DebuggingTips = (): JSX.Element => {
  const { episodeId } = useEpisodeId();

  return (
    <DocumentationPage
      text={debuggingTipsText[episodeId] ?? defaultDebuggingTipsText}
    />
  );
};

export default DebuggingTips;
