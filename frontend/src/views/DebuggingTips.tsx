import type React from "react";
import { debuggingTipsText } from "../content/ManageContent";
import { useEpisodeId } from "../contexts/EpisodeContext";
import OptionalSectionCardMarkdown from "../components/OptionalSectionCardMarkdown";
import { DebuggingTipsPage } from "../content/ContentStruct";
import NoContentFound from "./NoContentFound";
import { PageContainer } from "components/elements/BattlecodeStyle";
import { isNil } from "lodash";
const DebuggingTips: React.FC = () => {
  const { episodeId } = useEpisodeId();

  const currentDebuggingTipsText = debuggingTipsText[episodeId];
  const hasContent =
    !isNil(currentDebuggingTipsText) &&
    Object.values(currentDebuggingTipsText).some((value) => value !== "");

  if (!hasContent) {
    return <NoContentFound />;
  }

  return (
    <PageContainer>
      <div className="flex flex-1 flex-col gap-8">
        <OptionalSectionCardMarkdown
          title={DebuggingTipsPage.DEBUGGING}
          textRecord={currentDebuggingTipsText}
        />

        <OptionalSectionCardMarkdown
          title={DebuggingTipsPage.INTELLIJ}
          textRecord={currentDebuggingTipsText}
        />

        <OptionalSectionCardMarkdown
          title={DebuggingTipsPage.ECLIPSE}
          textRecord={currentDebuggingTipsText}
        />

        <OptionalSectionCardMarkdown
          title={DebuggingTipsPage.SECOND_METHOD}
          textRecord={currentDebuggingTipsText}
        />
      </div>
    </PageContainer>
  );
};

export default DebuggingTips;
