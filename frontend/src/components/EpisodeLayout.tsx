import type React from "react";
import { useEffect } from "react";
import Header from "./Header";
import Sidebar from "./sidebar";
import { Outlet, useParams } from "react-router-dom";
import { useEpisodeId } from "../contexts/EpisodeContext";

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
  return (
    <div className="h-screen bg-gray-200/80">
      <Header />
      <Sidebar />
      <div className="h-full pt-16 sm:pl-60">
        <Outlet />
      </div>
    </div>
  );
};

export default EpisodeLayout;
