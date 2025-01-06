import type React from "react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Header from "./Header";
import Sidebar from "./sidebar";
import { Outlet, useParams } from "react-router-dom";
import { useEpisodeId } from "../contexts/EpisodeContext";
import Cookies from "js-cookie";

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
    Cookies.get("sidebar-collapsed") === undefined
      ? !isLargeScreen
      : Cookies.get("sidebar-collapsed") === "true";

  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  const toggleSidebar = (): void => {
    const newCollapsedState = !collapsed;
    setCollapsed(newCollapsedState);
    Cookies.set("sidebar-collapsed", newCollapsedState.toString());
  };
  const SIDEBAR_WIDTH = 240;
  return (
    <div className="h-screen bg-gray-200/80">
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
        <Outlet />
      </motion.div>
    </div>
  );
};

export default EpisodeLayout;
