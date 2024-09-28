import React from "react";
import SidebarSection from "./SidebarSection";
import SidebarItem from "./SidebarItem";
import { useEpisodeId } from "../../contexts/EpisodeContext";
import { type IconName } from "../elements/Icon";
import { useCurrentUser } from "../../contexts/CurrentUserContext";
import { useUserTeam } from "../../api/team/useTeam";

interface SidebarProps {
  collapsed?: boolean;
}

export const SIDEBAR_ITEM_DATA: Array<{
  iconName: IconName;
  text: string;
  linkTo: string;
}> = [
  {
    iconName: "home",
    text: "Home",
    linkTo: "home",
  },
  {
    iconName: "map",
    text: "Quick Start",
    linkTo: "quick_start",
  },
  {
    iconName: "clipboard_document",
    text: "Resources",
    linkTo: "resources",
  },
  {
    iconName: "trophy",
    text: "Tournaments",
    linkTo: "tournaments",
  },
  {
    iconName: "chart_bar",
    text: "Rankings",
    linkTo: "rankings",
  },
  {
    iconName: "clock",
    text: "Queue",
    linkTo: "queue",
  },
  {
    iconName: "user_group",
    text: "My Team",
    linkTo: "my_team",
  },
  {
    iconName: "arrow_up_tray",
    text: "Submissions",
    linkTo: "submissions",
  },
  {
    iconName: "play_circle",
    text: "Scrimmaging",
    linkTo: "scrimmaging",
  },
];

/**
 *
 * @param startIndex The first sidebar item to include. 0-indexed, inclusive.
 * @param endIndex The last sidebar item to include (inclusive stop index)
 * @param episodeId The episodeId to link to (e.g. "bc23")
 * @returns
 */
export const generateSidebarItems = (
  startIndex: number,
  endIndex: number,
  episodeId: string,
): JSX.Element[] => {
  const result: JSX.Element[] = [];
  for (let i = startIndex; i <= endIndex; i++) {
    const itemData = SIDEBAR_ITEM_DATA[i];
    result.push(
      <SidebarItem
        key={i}
        {...itemData}
        linkTo={`/${episodeId}/${itemData.linkTo}`}
      />,
    );
  }
  return result;
};

// IMPORTANT: When changing this file, also remember to change the mobile menu that appears on small screens.
const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  collapsed = collapsed ?? false;
  const { episodeId } = useEpisodeId();
  const { user } = useCurrentUser();

  const teamData = useUserTeam({ episodeId });

  let teamManage;

  // construct teamManage if needed
  if (user !== undefined) {
    if (teamData.isSuccess) {
      teamManage = (
        <SidebarSection title="team management">
          {generateSidebarItems(6, 8, episodeId)}
        </SidebarSection>
      );
    } else {
      teamManage = (
        <SidebarSection title="team management">
          {generateSidebarItems(6, 6, episodeId)}
        </SidebarSection>
      );
    }
  }

  // generate sidebar
  return collapsed ? null : (
    <nav className="fixed top-16 z-10 hidden h-full w-52 flex-col gap-8 bg-gray-50 py-4 drop-shadow-[2px_0_2px_rgba(0,0,0,0.25)] sm:flex">
      <SidebarSection title="">
        {generateSidebarItems(0, 2, episodeId)}
      </SidebarSection>
      <SidebarSection title="compete">
        {generateSidebarItems(3, 5, episodeId)}
      </SidebarSection>
      {teamManage}
    </nav>
  );
};

export default Sidebar;
