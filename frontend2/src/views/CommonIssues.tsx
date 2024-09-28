import React from "react";
import {
  defaultCommonIssuesText,
  commonIssuesText,
} from "../content/ManageContent";

import { useEpisodeId } from "../contexts/EpisodeContext";
import Markdown from "../components/elements/Markdown";
import SectionCard from "../components/SectionCard";
import { CommonIssuesPage } from "../content/ContentStruct";

const DebuggingTips = (): JSX.Element => {
  const { episodeId } = useEpisodeId();
  const currentCommonIssuesText =
    commonIssuesText[episodeId] ?? defaultCommonIssuesText;
  return (
    <div className="flex h-full w-full flex-col overflow-y-auto bg-white p-6">
      <div className="flex flex-1 flex-col gap-8">
        <SectionCard>
          <Markdown
            text={`${
              currentCommonIssuesText[CommonIssuesPage.INSTALLATION_ISSUES]
            }`}
          />
        </SectionCard>
        <SectionCard>
          <Markdown
            text={`${currentCommonIssuesText[CommonIssuesPage.CLIENT_ISSUES]}`}
          />
        </SectionCard>
        <SectionCard>
          <Markdown
            text={`${currentCommonIssuesText[CommonIssuesPage.OTHER_ISSUES]}`}
          />
        </SectionCard>
        <SectionCard>
          <Markdown
            text={`${currentCommonIssuesText[CommonIssuesPage.THINGS_TO_TRY]}`}
          />
        </SectionCard>
      </div>
    </div>
  );
};

export default DebuggingTips;
