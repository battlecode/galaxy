import React from "react";
import {
  quickStartText,
  defaultQuickStartText,
} from "../content/ManageContent";
import { QuickStartPage } from "../content/ContentStruct";
import { useEpisodeId } from "../contexts/EpisodeContext";
import SectionCard from "../components/SectionCard";
import Markdown from "../components/elements/Markdown";

const QuickStart: React.FC = () => {
  const { episodeId } = useEpisodeId();
  const currentQuickStartText =
    quickStartText[episodeId] ?? defaultQuickStartText;

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto bg-white p-6">
      <div className="flex flex-1 flex-col gap-8">
        <SectionCard title={QuickStartPage.OVERVIEW}>
          <Markdown text={currentQuickStartText[QuickStartPage.OVERVIEW]} />
        </SectionCard>
        <SectionCard title={QuickStartPage.ACCOUNT_AND_TEAM_CREATION}>
          <Markdown
            text={
              currentQuickStartText[QuickStartPage.ACCOUNT_AND_TEAM_CREATION]
            }
          />
        </SectionCard>
        <SectionCard title={QuickStartPage.INSTALLATION}>
          <Markdown text={currentQuickStartText[QuickStartPage.INSTALLATION]} />
        </SectionCard>
        <SectionCard title={QuickStartPage.RESOURCES}>
          <Markdown text={currentQuickStartText[QuickStartPage.RESOURCES]} />
        </SectionCard>
        <SectionCard title={QuickStartPage.JOIN_THE_COMMUNITY}>
          <Markdown
            text={currentQuickStartText[QuickStartPage.JOIN_THE_COMMUNITY]}
          />
        </SectionCard>
      </div>
    </div>
  );
};

export default QuickStart;
