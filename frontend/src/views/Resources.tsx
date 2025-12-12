import type React from "react";
import { resourcesText } from "../content/ManageContent";
import { useEpisodeId } from "../contexts/EpisodeContext";
import OptionalSectionCardMarkdown from "../components/OptionalSectionCardMarkdown";
import { ResourcesPage } from "../content/ContentStruct";
import NoContentFound from "./NoContentFound";
import { isNil } from "lodash";
import SectionCard from "components/SectionCard";
import { NavLink } from "react-router-dom";
import { useEpisodeInfo } from "api/episode/useEpisode";
import { PageContainer } from "components/elements/BattlecodeStyle";

const Resources: React.FC = () => {
  const { episodeId } = useEpisodeId();

  const episode = useEpisodeInfo({ id: episodeId });

  const currentResourcesText = resourcesText[episodeId];
  const hasContent =
    !isNil(currentResourcesText) &&
    Object.values(currentResourcesText).some((value) => value !== "");

  if (!hasContent) {
    return <NoContentFound />;
  }

  return (
    <PageContainer>
      <div className="flex flex-1 flex-col gap-8">
        <SectionCard title="Game Specifications" loading={episode.isLoading}>
          <div className="flex flex-col gap-4">
            <NavLink
              to={`https://releases.battlecode.org/specs/${episode.data?.artifact_name}/${episode.data?.release_version_public}/specs.pdf`}
              className="text-cyan-600 hover:underline"
            >
              {`Specifications for ${episode.data?.name_long}!`}
            </NavLink>
            <NavLink
              to={`https://releases.battlecode.org/javadoc/${episode.data?.artifact_name}/${episode.data?.release_version_public}/index.html`}
              className="text-cyan-600 hover:underline"
            >
              {`API Specifications for ${episode.data?.name_long}!`}
            </NavLink>
          </div>
        </SectionCard>

        <OptionalSectionCardMarkdown
          title={ResourcesPage.LECTURES}
          textRecord={currentResourcesText}
        />

        <OptionalSectionCardMarkdown
          title={ResourcesPage.CODING_RESOURCES}
          textRecord={currentResourcesText}
        />

        <OptionalSectionCardMarkdown
          title={ResourcesPage.THIRD_PARTY_TOOLS}
          textRecord={currentResourcesText}
        />
      </div>
    </PageContainer>
  );
};

export default Resources;
