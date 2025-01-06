import type React from "react";
import { motion, AnimatePresence } from "framer-motion";
import SidebarSection from "./SidebarSection";
import type { IconName } from "../elements/Icon";
import type { UseQueryResult } from "@tanstack/react-query";
import { type Episode, type TeamPrivate, Status526Enum } from "api/_autogen";
import { type AuthState, AuthStateEnum } from "contexts/CurrentUserContext";

interface SidebarProps {
  collapsed: boolean;
}

enum UserAuthLevel {
  ONLY_LOGGED_OUT,
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
  {
    iconName: "computer_desktop",
    text: "Client",
    linkTo: "client",
    requireGameReleased: true,
    userAuthLevel: UserAuthLevel.LOGGED_IN_HAS_TEAM,
  },
];

const MOBILE_USER_ITEMS: SidebarItemData[] = [
  {
    iconName: "play_circle",
    text: "Login",
    linkTo: "login",
    requireGameReleased: false,
    userAuthLevel: UserAuthLevel.ONLY_LOGGED_OUT,
  },
  {
    iconName: "play_circle",
    text: "Register",
    linkTo: "register",
    requireGameReleased: false,
    userAuthLevel: UserAuthLevel.ONLY_LOGGED_OUT,
  },
];

export const ALL_SIDEBAR_ITEMS: SidebarItemData[] = [
  ...GENERAL_ITEMS,
  ...COMPETE_ITEMS,
  ...TEAM_MANAGEMENT_ITEMS,
  ...MOBILE_USER_ITEMS,
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
    if (itemData.userAuthLevel === UserAuthLevel.ONLY_LOGGED_OUT && loggedIn)
      return false;

    return true;
  });
};

// IMPORTANT: When changing this file, also remember to change the mobile menu that appears on small screens.
const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const sidebarVariants = {
    open: { x: 0, transition: { duration: 0.5, ease: "easeInOut" } },
    closed: { x: "-100%", transition: { duration: 0.5, ease: "easeInOut" } },
  };

  return (
    <AnimatePresence>
      {!collapsed && (
        <motion.nav
          initial="closed"
          animate="open"
          exit="closed"
          variants={sidebarVariants}
          className="fixed top-16 z-10 flex h-full w-60 flex-col gap-8 bg-gray-50 py-4 drop-shadow-[2px_0_2px_rgba(0,0,0,0.25)]"
        >
          <SidebarSection title="" items={GENERAL_ITEMS} />
          <SidebarSection title="compete" items={COMPETE_ITEMS} />
          <SidebarSection
            title="team management"
            items={TEAM_MANAGEMENT_ITEMS}
          />
          <div className="sm:hidden">
            <SidebarSection
              title="login management"
              items={MOBILE_USER_ITEMS}
            />
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;
