import React, { useMemo } from "react";
import { renderableItems, type SidebarItemData } from ".";
import SidebarItem from "./SidebarItem";
import { useEpisodeId } from "contexts/EpisodeContext";
import { useUserTeam } from "api/team/useTeam";
import { useEpisodeInfo } from "api/episode/useEpisode";

interface SidebarSectionProps {
  items: SidebarItemData[];
  title?: string;
}

const SidebarSection: React.FC<SidebarSectionProps> = ({ items, title }) => {
  const { episodeId } = useEpisodeId();

  const teamData = useUserTeam({ episodeId });
  const episodeData = useEpisodeInfo({ id: episodeId });

  const renderedItems = useMemo(
    () => renderableItems(items, episodeData, teamData),
    [items, episodeData, teamData],
  );

  return renderedItems.length > 0 ? (
    <div className="px-4">
      {title !== undefined && (
        <div className="mx-auto mb-2 font-light uppercase text-gray-500">
          {title}
        </div>
      )}
      <div className="flex flex-col gap-1">
        {renderedItems.map((itemData) => (
          <SidebarItem
            key={itemData.text}
            {...itemData}
            linkTo={`/${episodeId}/${itemData.linkTo}`}
          />
        ))}
      </div>
    </div>
  ) : null;
};

export default SidebarSection;
