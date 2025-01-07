import type React from "react";
import SidebarSection from "./SidebarSection";
import type { IconName } from "../elements/Icon";
import type { UseQueryResult } from "@tanstack/react-query";
import { type Episode, type TeamPrivate, Status526Enum } from "api/_autogen";
import { type AuthState, AuthStateEnum } from "contexts/CurrentUserContext";

interface SidebarProps {
  collapsed?: boolean;
}

enum UserAuthLevel {
  LOGGED_OUT,
  LOGGED_IN_NO_TEAM,
  LOGGED_IN_HAS_TEAM,
}

export interface SidebarItemData {
  iconName: IconName;
  text: string;
  linkTo: string;
  requireGameReleased: boolean;
  userAuthLevel: UserAuthLevel;
}

const GENERAL_ITEMS: SidebarItemData[] = [
  {
    iconName: "home",
    text: "Home",
    linkTo: "home",
    requireGameReleased: false,
    userAuthLevel: UserAuthLevel.LOGGED_OUT,
  },
  {
    iconName: "map",
    text: "Quick Start",
    linkTo: "quick_start",
    requireGameReleased: false,
    userAuthLevel: UserAuthLevel.LOGGED_OUT,
  },
  {
    iconName: "clipboard_document",
    text: "Resources",
    linkTo: "resources",
    requireGameReleased: true,
    userAuthLevel: UserAuthLevel.LOGGED_OUT,
  },
  {
    iconName: "question_mark_circle",
    text: "Common Issues",
    linkTo: "common_issues",
    requireGameReleased: false,
    userAuthLevel: UserAuthLevel.LOGGED_OUT,
  },
  {
    iconName: "light_bulb",
    text: "Debugging Tips",
    linkTo: "debugging_tips",
    requireGameReleased: false,
    userAuthLevel: UserAuthLevel.LOGGED_OUT,
  },
  {
    iconName: "shield_check",
    text: "Code of Conduct",
    linkTo: "code_of_conduct",
    requireGameReleased: false,
    userAuthLevel: UserAuthLevel.LOGGED_OUT,
  },
];
const COMPETE_ITEMS: SidebarItemData[] = [
  {
    iconName: "trophy",
    text: "Tournaments",
    linkTo: "tournaments",
    requireGameReleased: true,
    userAuthLevel: UserAuthLevel.LOGGED_OUT,
  },
  {
    iconName: "chart_bar",
    text: "Rankings",
    linkTo: "rankings",
    requireGameReleased: false,
    userAuthLevel: UserAuthLevel.LOGGED_OUT,
  },
  {
    iconName: "clock",
    text: "Queue",
    linkTo: "queue",
    requireGameReleased: true,
    userAuthLevel: UserAuthLevel.LOGGED_OUT,
  },
];
const TEAM_MANAGEMENT_ITEMS: SidebarItemData[] = [
  {
    iconName: "user_group",
    text: "My Team",
    linkTo: "my_team",
    requireGameReleased: false,
    userAuthLevel: UserAuthLevel.LOGGED_IN_NO_TEAM,
  },
  {
    iconName: "arrow_up_tray",
    text: "Submissions",
    linkTo: "submissions",
    requireGameReleased: true,
    userAuthLevel: UserAuthLevel.LOGGED_IN_HAS_TEAM,
  },
  {
    iconName: "play_circle",
    text: "Scrimmaging",
    linkTo: "scrimmaging",
    requireGameReleased: true,
    userAuthLevel: UserAuthLevel.LOGGED_IN_HAS_TEAM,
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
  authState: AuthState,
  userTeam: UseQueryResult<TeamPrivate>,
): SidebarItemData[] => {
  const gameReleased =
    episode.isSuccess && episode.data.game_release.getTime() < Date.now();

  const loggedIn = authState === AuthStateEnum.AUTHENTICATED;

  const userHasTeam = userTeam.isSuccess;
  const staffTeam = userTeam.data?.status === Status526Enum.S;

  return items.filter((itemData) => {
    // Ensure that we are allowed to render this item
    if (!staffTeam && itemData.requireGameReleased && !gameReleased)
      return false;
    if (itemData.userAuthLevel > UserAuthLevel.LOGGED_OUT && !loggedIn)
      return false;
    if (
      itemData.userAuthLevel > UserAuthLevel.LOGGED_IN_NO_TEAM &&
      !userHasTeam
    )
      return false;

    return true;
  });
};

// IMPORTANT: When changing this file, also remember to change the mobile menu that appears on small screens.
const Sidebar: React.FC<SidebarProps> = ({ collapsed = false }) =>
  collapsed ? null : (
    <nav className="fixed top-16 z-10 hidden h-full w-60 flex-col gap-8 overflow-y-auto bg-gray-50 pb-24 pt-4 drop-shadow-[2px_0_2px_rgba(0,0,0,0.25)] sm:flex">
      <SidebarSection title="" items={GENERAL_ITEMS} />
      <SidebarSection title="compete" items={COMPETE_ITEMS} />
      <SidebarSection title="team management" items={TEAM_MANAGEMENT_ITEMS} />
    </nav>
  );

export default Sidebar;
