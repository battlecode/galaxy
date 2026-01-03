import type React from "react";
import { quickStartText } from "../content/ManageContent";
import { QuickStartPage } from "../content/ContentStruct";
import { useEpisodeId } from "../contexts/EpisodeContext";
import OptionalSectionCardMarkdown from "../components/OptionalSectionCardMarkdown";
import NoContentFound from "./NoContentFound";
import { PageContainer } from "components/elements/BattlecodeStyle";
import { isNil } from "lodash";
const QuickStart: React.FC = () => {
  const { episodeId } = useEpisodeId();

  const currentQuickStartText = quickStartText[episodeId];
  const hasContent =
    !isNil(currentQuickStartText) &&
    Object.values(currentQuickStartText).some((value) => value !== "");

  if (!hasContent) {
    return <NoContentFound />;
  }

  return (
    <PageContainer>
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
          title={QuickStartPage.INSTALLATION_AND_SETUP}
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
    </PageContainer>
  );
};

export default QuickStart;
