import React from "react";
import NavBar from "./NavBar";
import SideBar from "./SideBar";
import { Outlet } from "react-router-dom"

// This component contains the NavBar and SideBar.
// Child route components are rendered with <Outlet />
const EpisodeLayout: React.FC = () => {
  return <div className="min-h-full">
    <NavBar />
    <div className="">
      <SideBar />
      <Outlet />
    </div>
  </div>;
};

export default EpisodeLayout;;
