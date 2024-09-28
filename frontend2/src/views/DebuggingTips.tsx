import React from "react";
import {
  defaultDebuggingTipsText,
  debuggingTipsText,
} from "../content/ManageContent";
import DocumentationPage from "../components/DocumentationPage";
import { useEpisodeId } from "../contexts/EpisodeContext";
import SectionCard from "../components/SectionCard";
import Markdown from "../components/elements/Markdown";
import { DebuggingTipsPage } from "../content/ContentStruct";

const DebuggingTips = (): JSX.Element => {
  const { episodeId } = useEpisodeId();
  const currentDebuggingTipsText =
    debuggingTipsText[episodeId] ?? defaultDebuggingTipsText;

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto bg-white p-6">
      <div className="flex flex-1 flex-col gap-8">
        <SectionCard>
          <Markdown
            text={`${currentDebuggingTipsText[DebuggingTipsPage.DEBUGGING]}`}
          />
        </SectionCard>
        <SectionCard>
          <Markdown
            text={`${currentDebuggingTipsText[DebuggingTipsPage.INTELLIJ]}`}
          />
        </SectionCard>
        <SectionCard>
          <Markdown
            text={`${currentDebuggingTipsText[DebuggingTipsPage.ECLIPSE]}`}
          />
        </SectionCard>
        <SectionCard>
          <Markdown
            text={`${
              currentDebuggingTipsText[DebuggingTipsPage.SECOND_METHOD]
            }`}
          />
        </SectionCard>
      </div>
    </div>
  );
};

export default DebuggingTips;
