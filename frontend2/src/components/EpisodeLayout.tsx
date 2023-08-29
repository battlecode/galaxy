import React, { useContext } from "react";
import Header from "./Header";
import Sidebar from "./sidebar";
import { Outlet, useParams } from "react-router-dom";
import { EpisodeContext } from "../contexts/EpisodeContext";

// This component contains the Header and SideBar.
// Child route components are rendered with <Outlet />
const EpisodeLayout: React.FC = () => {
  const episodeContext = useContext(EpisodeContext);
  const { episodeId } = useParams();
  if (episodeId !== undefined && episodeId !== episodeContext.episodeId) {
    episodeContext.setEpisodeId(episodeId);
  }
  return (
    <div className="h-screen">
      <Header />
      <div className="flex h-full flex-row">
        <Sidebar />
        <Outlet />
      </div>
    </div>
  );
};

export default EpisodeLayout;
