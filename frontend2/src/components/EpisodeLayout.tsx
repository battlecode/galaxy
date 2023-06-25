import React, { useContext } from "react";
import Navbar from "./Navbar";
import Sidebar from "./sidebar";
import { Outlet, useParams } from "react-router-dom";
import { EpisodeContext } from "../contexts/EpisodeContext";

// This component contains the NavBar and SideBar.
// Child route components are rendered with <Outlet />
const EpisodeLayout: React.FC = () => {
  const episodeContext = useContext(EpisodeContext);
  const { episode } = useParams();
  if (episode !== undefined && episode !== episodeContext.episode) {
    episodeContext.setEpisode(episode);
  }
  return (
    <div className="h-screen">
      <Navbar/>
      <div className="flex flex-row h-full">
        <Sidebar />
        <Outlet />
      </div>
    </div>
  );
};

export default EpisodeLayout;
