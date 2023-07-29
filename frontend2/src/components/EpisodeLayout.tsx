import React, { useContext } from "react";
import Navbar from "./Navbar";
import Sidebar from "./sidebar";
import { Outlet, useParams } from "react-router-dom";
import { EpisodeContext } from "../contexts/EpisodeContext";
import { useCurrentUser } from "../contexts/CurrentUserContext";

// This component contains the NavBar and SideBar.
// Child route components are rendered with <Outlet />
const EpisodeLayout: React.FC = () => {
  const episodeContext = useContext(EpisodeContext);
  const { episodeId } = useParams();
  if (episodeId !== undefined && episodeId !== episodeContext.episodeId) {
    episodeContext.setEpisodeId(episodeId);
  }
  return (
    <div className="h-screen">
      <Navbar />
      <div className="flex flex-row h-full">
        <Sidebar />
        <Outlet />
      </div>
    </div>
  );
};

export default EpisodeLayout;
