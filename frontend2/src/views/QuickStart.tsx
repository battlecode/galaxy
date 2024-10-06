import React from "react";
import { quickStartText } from "../content/ManageContent";
import { QuickStartPage } from "../content/ContentStruct";
import { useEpisodeId } from "../contexts/EpisodeContext";
import OptionalSectionCardMarkdown from "../components/OptionalSectionCardMarkdown";
import NoContentLegacyEpisode from "./NoContentLegacyEpisode";
const QuickStart: React.FC = () => {
  const { episodeId } = useEpisodeId();
  const currentQuickStartText = quickStartText[episodeId];
  const hasContent = Object.values(currentQuickStartText).some(
    (value) => value !== "",
  );
  if (!hasContent) {
    return <NoContentLegacyEpisode />;
  }
  return (
    <div className="flex h-full w-full flex-col overflow-y-auto bg-white p-6">
      <div className="flex flex-1 flex-col gap-8">
        <OptionalSectionCardMarkdown
          title={QuickStartPage.OVERVIEW}
          textRecord={currentQuickStartText}
        />

        <OptionalSectionCardMarkdown
          title={QuickStartPage.ACCOUNT_AND_TEAM_CREATION}
          textRecord={currentQuickStartText}
        />

        <OptionalSectionCardMarkdown
          title={QuickStartPage.INSTALLATION}
          textRecord={currentQuickStartText}
        />

        <OptionalSectionCardMarkdown
          title={QuickStartPage.RESOURCES}
          textRecord={currentQuickStartText}
        />

        <OptionalSectionCardMarkdown
          title={QuickStartPage.JOIN_THE_COMMUNITY}
          textRecord={currentQuickStartText}
        />
      </div>
    </div>
  );
};

export default QuickStart;
