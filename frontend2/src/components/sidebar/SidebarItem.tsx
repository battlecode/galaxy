import React from "react";
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
  const baseStyle = "text-base flex items-center gap-3 ";
  const colorVariants = {
    gray: "text-gray-800 hover:text-gray-400",
    color: "text-teal",
  };
  return (
    <NavLink
      className={({ isActive }) =>
        baseStyle + (isActive ? colorVariants.color : colorVariants.gray)
      }
      to={linkTo}
    >
      <Icon name={iconName} size="md" />
      {text}
    </NavLink>
  );
};

export default SidebarItem;
