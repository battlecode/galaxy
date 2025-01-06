import type React from "react";
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
  const defaultCollapsed = Cookies.get("sidebar-collapsed") === undefined
    ? !isLargeScreen
    : Cookies.get("sidebar-collapsed") === "true";

  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  const toggleSidebar = (): void => {
    const newCollapsedState = !collapsed;
    setCollapsed(newCollapsedState);
    Cookies.set("sidebar-collapsed", newCollapsedState.toString());
  };

  return (
    <div className="h-screen bg-gray-200/80">
      <Header toggleSidebar={toggleSidebar} />
      <Sidebar collapsed={collapsed} />
      <div className="h-full pt-16 sm:pl-60">
        <Outlet />
      </div>
    </div>
  );
};

export default EpisodeLayout;
