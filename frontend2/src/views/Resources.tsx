import type React from "react";
import { resourcesText } from "../content/ManageContent";
import { useEpisodeId } from "../contexts/EpisodeContext";
import OptionalSectionCardMarkdown from "../components/OptionalSectionCardMarkdown";
import { ResourcesPage } from "../content/ContentStruct";
import NoContentFound from "./NoContentFound";
import { isNil } from "lodash";

const Resources: React.FC = () => {
  const { episodeId } = useEpisodeId();

  const currentResourcesText = resourcesText[episodeId];
  const hasContent =
    !isNil(currentResourcesText) &&
    Object.values(currentResourcesText).some((value) => value !== "");

  if (!hasContent) {
    return <NoContentFound />;
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
