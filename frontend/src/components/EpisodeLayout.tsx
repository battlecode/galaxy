import type React from "react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Header from "./Header";
import Sidebar from "./sidebar";
import { Outlet, useParams } from "react-router-dom";
import { useEpisodeId } from "../contexts/EpisodeContext";
import { useCurrentUser } from "../contexts/CurrentUserContext";
import EmailVerificationBanner from "./EmailVerificationBanner";
import Cookies from "js-cookie";
const SIDEBAR_WIDTH = 240;

// This component contains the Header and SideBar.
// Child route components are rendered with <Outlet />
const EpisodeLayout: React.FC = () => {
  const episodeContext = useEpisodeId();
  const { episodeId } = useParams();
  useEffect(() => {
    if (episodeId !== undefined && episodeId !== episodeContext.episodeId) {
      episodeContext.setEpisodeId(episodeId);
    }
  }, [episodeId]);

  // Detect screen size and set default collapsed value
  const isLargeScreen = window.matchMedia("(min-width: 640px)").matches;
  const defaultCollapsed =
    !isLargeScreen || Cookies.get("sidebar-collapsed") === "true";

  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  //to collapse the sidebar when the screen size changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 640px)");

    const handleMediaQueryChange = (event: MediaQueryListEvent): void => {
      if (!event.matches) {
        setCollapsed(true);
      } else {
        const cookieCollapsed = Cookies.get("sidebar-collapsed") === "true";
        setCollapsed(cookieCollapsed);
      }
    };

    mediaQuery.addEventListener("change", handleMediaQueryChange);

    return () => {
      mediaQuery.removeEventListener("change", handleMediaQueryChange);
    };
  }, []);

  const toggleSidebar = (): void => {
    const newCollapsedState = !collapsed;
    setCollapsed(newCollapsedState);
    Cookies.set("sidebar-collapsed", newCollapsedState.toString());
  };

  const { user } = useCurrentUser();
  const showVerificationBanner =
    user.isSuccess && !user.data.email_verified && !user.data.is_staff;

  return (
    <div className="h-full min-h-screen bg-gray-200/80">
      <Header toggleSidebar={toggleSidebar} />
      <Sidebar collapsed={collapsed} />
      <motion.div
        className="h-full pt-16"
        initial={false}
        animate={{
          paddingLeft: collapsed ? 0 : SIDEBAR_WIDTH, // Assuming sidebar width is 240px
        }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        {showVerificationBanner && (
          <div className="p-4">
            <EmailVerificationBanner email={user.data.email} />
          </div>
        )}
        <Outlet />
      </motion.div>
    </div>
  );
};

export default EpisodeLayout;
