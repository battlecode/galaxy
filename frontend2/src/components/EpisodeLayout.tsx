import React, { useContext, useEffect } from "react";
import Header from "./Header";
import Sidebar from "./sidebar";
import { Outlet, useParams } from "react-router-dom";
import { EpisodeContext } from "../contexts/EpisodeContext";

// This component contains the Header and SideBar.
// Child route components are rendered with <Outlet />
const EpisodeLayout: React.FC = () => {
  const episodeContext = useContext(EpisodeContext);
  const { episodeId } = useParams();
  useEffect(() => {
    if (episodeId !== undefined && episodeId !== episodeContext.episodeId) {
      episodeContext.setEpisodeId(episodeId);
    }
  }, [episodeId]);
  return (
    <div className="h-screen overflow-auto">
      <Header />
      <Sidebar />
      <div className="fixed right-0 h-full mt-16 sm:left-52">
        <Outlet />
      </div>
    </div>
  );
};

export default EpisodeLayout;
