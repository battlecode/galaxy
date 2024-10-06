import React from "react";
import { resourcesText } from "../content/ManageContent";
import { useEpisodeId } from "../contexts/EpisodeContext";
import OptionalSectionCardMarkdown from "../components/OptionalSectionCardMarkdown";
import { ResourcesPage } from "../content/ContentStruct";
import NoContentLegacyEpisode from "./NoContentLegacyEpisode";

const Resources: React.FC = () => {
  const { episodeId } = useEpisodeId();
  const currentResourcesText = resourcesText[episodeId];
  const hasContent = Object.values(currentResourcesText).some(
    (value) => value !== "",
  );
  if (!hasContent) {
    return <NoContentLegacyEpisode />;
  }
  return (
    <div className="flex h-full w-full flex-col overflow-y-auto bg-white p-6">
      <div className="flex flex-1 flex-col gap-8">
        <OptionalSectionCardMarkdown
          title={ResourcesPage.GAME_SPECIFICATION}
          textRecord={currentResourcesText}
        />

        <OptionalSectionCardMarkdown
          title={ResourcesPage.CODING_RESOURCES}
          textRecord={currentResourcesText}
        />

        <OptionalSectionCardMarkdown
          title={ResourcesPage.THIRD_PARTY_TOOLS}
          textRecord={currentResourcesText}
        />

        <OptionalSectionCardMarkdown
          title={ResourcesPage.LECTURES}
          textRecord={currentResourcesText}
        />
      </div>
    </div>
  );
};

export default Resources;
