import React from "react";
import {
  defaultCommonIssuesText,
  commonIssuesText,
} from "../content/ManageContent";

import { useEpisodeId } from "../contexts/EpisodeContext";
import OptionalSectionCardMarkdown from "../components/OptionalSectionCardMarkdown";
import { CommonIssuesPage } from "../content/ContentStruct";

const CommmonIssues: React.FC = () => {
  const { episodeId } = useEpisodeId();
  const currentCommonIssuesText =
    commonIssuesText[episodeId] ?? defaultCommonIssuesText;
  return (
    <div className="flex h-full w-full flex-col overflow-y-auto bg-white p-6">
      <div className="flex flex-1 flex-col gap-8">

        <OptionalSectionCardMarkdown
          title={CommonIssuesPage.INSTALLATION_ISSUES}
          textRecord={currentCommonIssuesText}
        ></OptionalSectionCardMarkdown>

        <OptionalSectionCardMarkdown
          title={CommonIssuesPage.CLIENT_ISSUES}
          textRecord={currentCommonIssuesText}
        ></OptionalSectionCardMarkdown>

        <OptionalSectionCardMarkdown
          title={CommonIssuesPage.OTHER_ISSUES}
          textRecord={currentCommonIssuesText}
        ></OptionalSectionCardMarkdown>

        <OptionalSectionCardMarkdown
          title={CommonIssuesPage.THINGS_TO_TRY}
          textRecord={currentCommonIssuesText}
        ></OptionalSectionCardMarkdown>

      </div>
    </div>
  );
};

export default CommmonIssues;
