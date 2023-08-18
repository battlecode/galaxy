import React, { useContext } from "react";
import SidebarSection from "./SidebarSection";
import SidebarItem from "./SidebarItem";
import { EpisodeContext } from "../../contexts/EpisodeContext";

interface SidebarProps {
  collapsed?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  collapsed = collapsed ?? false;
  const { episodeId } = useContext(EpisodeContext);
  const linkBase = `/${episodeId}/`;

  return collapsed ? null : (
    <div className="flex flex-col gap-8 py-4 h-full bg-gray-50 shadow-gray-200 shadow-sm">
      <SidebarSection title="">
        <SidebarItem iconName="home" text="Home" linkTo={`${linkBase}home`} />
        <SidebarItem
          iconName="map"
          text="Quick Start"
          linkTo={`${linkBase}quickstart`}
        />
        <SidebarItem
          iconName="clipboard_document"
          text="Resources"
          linkTo={`${linkBase}resources`}
        />
      </SidebarSection>
      <SidebarSection title="compete">
        <SidebarItem
          iconName="trophy"
          text="Tournaments"
          linkTo={`${linkBase}tournaments`}
        />
        <SidebarItem
          iconName="chart_bar"
          text="Rankings"
          linkTo={`${linkBase}rankings`}
        />
        <SidebarItem
          iconName="clock"
          text="Queue"
          linkTo={`${linkBase}queue`}
        />
      </SidebarSection>
      <SidebarSection title="team management">
        <SidebarItem
          iconName="user_group"
          text="My Team"
          linkTo={`${linkBase}team`}
        />
        <SidebarItem
          iconName="arrow_up_tray"
          text="Submissions"
          linkTo={`${linkBase}submission`}
        />
        <SidebarItem
          iconName="play_circle"
          text="Scrimmaging"
          linkTo={`${linkBase}scrimmaging`}
        />
      </SidebarSection>
    </div>
  );
};

export default Sidebar;
