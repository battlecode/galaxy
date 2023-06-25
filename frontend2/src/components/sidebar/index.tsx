import React, { useContext } from "react";
import SidebarSection from "./SidebarSection";
import SidebarItem from "./SidebarItem";
import {
  ClipboardDocumentIcon, HomeIcon, MapIcon,
  TrophyIcon, ChartBarIcon, ClockIcon,
  UserGroupIcon, ArrowUpTrayIcon, PlayCircleIcon,
} from "@heroicons/react/24/outline";
import { EpisodeContext } from "../../contexts/EpisodeContext";

interface SidebarProps {
  collapsed?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  collapsed
}) => {
  collapsed = collapsed ?? false;
  const { episodeId } = useContext(EpisodeContext);
  const linkBase = `/${episodeId}/`;

  return (
    collapsed ? null : (
      <div className="flex flex-col gap-8 py-4 h-full bg-gray-50 shadow-gray-200 shadow-sm">
        <SidebarSection title="" >
          <SidebarItem
            icon={<HomeIcon className="h-6 w-6" />}
            text="Home"
            linkTo={`${linkBase}home`}
          />
          <SidebarItem
            icon={<MapIcon className="h-6 w-6" />}
            text="Quick Start"
            linkTo={`${linkBase}quickstart`}
          />
          <SidebarItem
            icon={<ClipboardDocumentIcon className="h-6 w-6" />}
            text="Resources"
            linkTo={`${linkBase}resources`}
          />
        </SidebarSection>
        <SidebarSection title="compete" >
          <SidebarItem
            icon={<TrophyIcon className="h-6 w-6" />}
            text="Tournaments"
            linkTo={`${linkBase}tournaments`}
          />
          <SidebarItem
            icon={<ChartBarIcon className="h-6 w-6" />}
            text="Rankings"
            linkTo={`${linkBase}rankings`}
          />
          <SidebarItem
            icon={<ClockIcon className="h-6 w-6" />}
            text="Queue"
            linkTo={`${linkBase}queue`}
          />
        </SidebarSection>
        <SidebarSection title="team management" >
          <SidebarItem
            icon={<UserGroupIcon className="h-6 w-6" />}
            text="My Team"
            linkTo={`${linkBase}team`}
          />
          <SidebarItem
            icon={<ArrowUpTrayIcon className="h-6 w-6" />}
            text="Submissions"
            linkTo={`${linkBase}submission`}
          />
          <SidebarItem
            icon={<PlayCircleIcon className="h-6 w-6" />}
            text="Scrimmaging"
            linkTo={`${linkBase}scrimmaging`}
          />
        </SidebarSection>
      </div>
    )
  );


};

export default Sidebar;
