import type React from "react";
import { commonIssuesText } from "../content/ManageContent";

import { useEpisodeId } from "../contexts/EpisodeContext";
import OptionalSectionCardMarkdown from "../components/OptionalSectionCardMarkdown";
import { CommonIssuesPage } from "../content/ContentStruct";
import NoContentFound from "./NoContentFound";
import { PageContainer } from "components/elements/BattlecodeStyle";
import { isNil } from "lodash";
const CommmonIssues: React.FC = () => {
  const { episodeId } = useEpisodeId();

  const currentCommonIssuesText = commonIssuesText[episodeId];
  const hasContent =
    !isNil(currentCommonIssuesText) &&
    Object.values(currentCommonIssuesText).some((value) => value !== "");

  if (!hasContent) {
    return <NoContentFound />;
  }

  return (
    <PageContainer>
      <div className="flex flex-1 flex-col gap-8">
        <OptionalSectionCardMarkdown
          title={CommonIssuesPage.INSTALLATION_ISSUES}
          textRecord={currentCommonIssuesText}
        />

        <OptionalSectionCardMarkdown
          title={CommonIssuesPage.CLIENT_ISSUES}
          textRecord={currentCommonIssuesText}
        />

        <OptionalSectionCardMarkdown
          title={CommonIssuesPage.OTHER_ISSUES}
          textRecord={currentCommonIssuesText}
        />

        <OptionalSectionCardMarkdown
          title={CommonIssuesPage.THINGS_TO_TRY}
          textRecord={currentCommonIssuesText}
        />
      </div>
    </PageContainer>
  );
};

export default CommmonIssues;
