import React from "react";
import { defaultResourcesText, resourcesText } from "../content/ManageContent";
import { useEpisodeId } from "../contexts/EpisodeContext";
import OptionalSectionCardMarkdown from "../components/OptionalSectionCardMarkdown";
import { ResourcesPage } from "../content/ContentStruct";

const Resources: React.FC = () => {
  const { episodeId } = useEpisodeId();

  const currentResourcesText = resourcesText[episodeId] ?? defaultResourcesText;
  return (
    <div className="flex h-full w-full flex-col overflow-y-auto bg-white p-6">
      <div className="flex flex-1 flex-col gap-8">

      <OptionalSectionCardMarkdown
          title={ResourcesPage.GAME_SPECIFICATION}
          textRecord={currentResourcesText}
        ></OptionalSectionCardMarkdown>

        <OptionalSectionCardMarkdown
          title={ResourcesPage.CODING_RESOURCES}
          textRecord={currentResourcesText}
        ></OptionalSectionCardMarkdown>

        <OptionalSectionCardMarkdown
          title={ResourcesPage.THIRD_PARTY_TOOLS}
          textRecord={currentResourcesText}
        ></OptionalSectionCardMarkdown>

        <OptionalSectionCardMarkdown
          title={ResourcesPage.LECTURES}
          textRecord={currentResourcesText}
        ></OptionalSectionCardMarkdown>

      </div>
    </div>
  );
};

export default Resources;
