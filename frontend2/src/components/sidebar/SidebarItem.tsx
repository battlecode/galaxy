import type React from "react";
import { NavLink } from "react-router-dom";
import Icon, { type IconName } from "../elements/Icon";

interface SidebarItemProps {
  iconName: IconName;
  text: string;
  linkTo: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  iconName,
  text,
  linkTo,
}) => {
  const colorVariants = {
    gray: "text-gray-800 hover:text-gray-100 hover:bg-gray-500",
    color: "text-cyan-600",
  };
  return (
    <NavLink
      className={({ isActive }) =>
        "flex items-center gap-3 rounded-lg py-2 pl-1.5 pr-8 text-base " +
        (isActive ? colorVariants.color : colorVariants.gray)
      }
      to={linkTo}
    >
      <Icon name={iconName} size="md" />
      {text}
    </NavLink>
  );
};

export default SidebarItem;
