import React from "react";
import {
  defaultDebuggingTipsText,
  debuggingTipsText,
} from "../content/ManageContent";
import { useEpisodeId } from "../contexts/EpisodeContext";
import OptionalSectionCardMarkdown from "../components/OptionalSectionCardMarkdown";
import { DebuggingTipsPage } from "../content/ContentStruct";

const DebuggingTips: React.FC = () => {
  const { episodeId } = useEpisodeId();
  const currentDebuggingTipsText =
    debuggingTipsText[episodeId] ?? defaultDebuggingTipsText;

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto bg-white p-6">
      <div className="flex flex-1 flex-col gap-8">

        <OptionalSectionCardMarkdown
          title={DebuggingTipsPage.DEBUGGING}
          textRecord={currentDebuggingTipsText}
        ></OptionalSectionCardMarkdown>

        <OptionalSectionCardMarkdown
          title={DebuggingTipsPage.INTELLIJ}
          textRecord={currentDebuggingTipsText}
        ></OptionalSectionCardMarkdown>

        <OptionalSectionCardMarkdown
          title={DebuggingTipsPage.ECLIPSE}
          textRecord={currentDebuggingTipsText}
        ></OptionalSectionCardMarkdown>

        <OptionalSectionCardMarkdown
          title={DebuggingTipsPage.SECOND_METHOD}
          textRecord={currentDebuggingTipsText}
        ></OptionalSectionCardMarkdown>
        
      </div>
    </div>
  );
};

export default DebuggingTips;
