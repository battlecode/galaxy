/* eslint-disable --
 * TODO: this file will be corrected in https://github.com/battlecode/galaxy/pull/853
 */

import type React from "react";
import SidebarSection from "./SidebarSection";
import { type IconName } from "../elements/Icon";
import type { Episode, TeamPrivate } from "api/_autogen";
import type { UseQueryResult } from "@tanstack/react-query";

interface SidebarProps {
  collapsed?: boolean;
}

export interface SidebarItemData {
  iconName: IconName;
  text: string;
  linkTo: string;
  requireGameReleased: boolean;
  requireUserTeam: boolean;
}

const GENERAL_ITEMS: SidebarItemData[] = [
  {
    iconName: "home",
    text: "Home",
    linkTo: "home",
    requireGameReleased: false,
    requireUserTeam: false,
  },
  {
    iconName: "map",
    text: "Quick Start",
    linkTo: "quick_start",
    requireGameReleased: false,
    requireUserTeam: false,
  },
  {
    iconName: "clipboard_document",
    text: "Resources",
    linkTo: "resources",
    requireGameReleased: false,
    requireUserTeam: false,
  },
];
const COMPETE_ITEMS: SidebarItemData[] = [
  {
    iconName: "trophy",
    text: "Tournaments",
    linkTo: "tournaments",
    requireGameReleased: true,
    requireUserTeam: false,
  },
  {
    iconName: "chart_bar",
    text: "Rankings",
    linkTo: "rankings",
    requireGameReleased: true,
    requireUserTeam: false,
  },
  {
    iconName: "clock",
    text: "Queue",
    linkTo: "queue",
    requireGameReleased: true,
    requireUserTeam: false,
  },
];
const TEAM_MANAGEMENT_ITEMS: SidebarItemData[] = [
  {
    iconName: "user_group",
    text: "My Team",
    linkTo: "my_team",
    requireGameReleased: false,
    requireUserTeam: false,
  },
  {
    iconName: "arrow_up_tray",
    text: "Submissions",
    linkTo: "submissions",
    requireGameReleased: true,
    requireUserTeam: true,
  },
  {
    iconName: "play_circle",
    text: "Scrimmaging",
    linkTo: "scrimmaging",
    requireGameReleased: true,
    requireUserTeam: true,
  },
];

export const ALL_SIDEBAR_ITEMS: SidebarItemData[] = [
  ...GENERAL_ITEMS,
  ...COMPETE_ITEMS,
  ...TEAM_MANAGEMENT_ITEMS,
];

export const renderableItems = (
  items: SidebarItemData[],
  episode: UseQueryResult<Episode>,
  userTeam: UseQueryResult<TeamPrivate>,
): SidebarItemData[] => {
  const gameReleased =
    episode.isSuccess && episode.data.game_release.getTime() < Date.now();

  const userHasTeam = userTeam.isSuccess;

  return items.filter((itemData) => {
    // Ensure that we are allowed to render this item
    if (itemData.requireGameReleased && !gameReleased) return false;
    if (itemData.requireUserTeam && !userHasTeam) return false;

    return true;
  });
};

// IMPORTANT: When changing this file, also remember to change the mobile menu that appears on small screens.
const Sidebar: React.FC<SidebarProps> = ({ collapsed = false }) => {
  return collapsed ? null : (
    <nav className="fixed top-16 z-10 hidden h-full w-52 flex-col gap-8 bg-gray-50 py-4 drop-shadow-[2px_0_2px_rgba(0,0,0,0.25)] sm:flex">
      <SidebarSection title="" items={GENERAL_ITEMS} />
      <SidebarSection title="compete" items={COMPETE_ITEMS} />
      <SidebarSection title="team management" items={TEAM_MANAGEMENT_ITEMS} />
    </nav>
  );
};

export default Sidebar;
