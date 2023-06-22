import React from "react";
import SidebarItem from "./elements/SidebarItem";
import { BeakerIcon } from '@heroicons/react/24/solid';
import { useLocation } from "react-router-dom";

const SidebarSection: React.FC = () => {
  const location = useLocation();
  return (
    <div className="flex-col gap-2">
      <SidebarItem
        icon={<BeakerIcon className="h-6 w-6" />}
        text="Home"
        linkTo="/"
        selected={false} />
      <SidebarItem
        icon={<BeakerIcon className="h-6 w-6" />}
        text="Quick Start"
        linkTo="/quickstart"
        selected={true} />
    </div>
  );
};

export default SidebarSection;
