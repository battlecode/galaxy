import React from "react";
import { defaultResourcesText, resourcesText } from "../content/ManageContent";
import { useEpisodeId } from "../contexts/EpisodeContext";
import Markdown from "../components/elements/Markdown";
import SectionCard from "../components/SectionCard";
import { ResourcesPage } from "../content/ContentStruct";

const Resources: React.FC = () => {
  const { episodeId } = useEpisodeId();

  const currentResourcesText = resourcesText[episodeId] ?? defaultResourcesText;
  return (
    <div className="flex h-full w-full flex-col overflow-y-auto bg-white p-6">
      <div className="flex flex-1 flex-col gap-8">
        <SectionCard title={ResourcesPage.GAME_SPECIFICATION}>
          <Markdown
            text={currentResourcesText[ResourcesPage.GAME_SPECIFICATION]}
          />
        </SectionCard>
        <SectionCard title={ResourcesPage.CODING_RESOURCES}>
          <Markdown
            text={currentResourcesText[ResourcesPage.CODING_RESOURCES]}
          />
        </SectionCard>
        <SectionCard title={ResourcesPage.THIRD_PARTY_TOOLS}>
          <Markdown
            text={currentResourcesText[ResourcesPage.THIRD_PARTY_TOOLS]}
          />
        </SectionCard>
        <SectionCard title={ResourcesPage.LECTURES}>
          <Markdown text={currentResourcesText[ResourcesPage.LECTURES]} />
        </SectionCard>
      </div>
    </div>
  );
};

export default Resources;
