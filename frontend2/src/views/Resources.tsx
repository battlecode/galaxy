import React from "react";
import { defaultResourcesText, resourcesText } from "../content/ManageContent";
import DocumentationPage from "../components/DocumentationPage";
import { useEpisodeId } from "../contexts/EpisodeContext";

const Resources = (): JSX.Element => {
  const { episodeId } = useEpisodeId();

  return (
    <DocumentationPage
      text={resourcesText[episodeId] ?? defaultResourcesText}
    />
  );
};

export default Resources;
