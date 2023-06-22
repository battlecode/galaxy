import React from "react";
import { NavLink } from 'react-router-dom';

interface SidebarItemProps {
  icon: React.ReactNode,
  text: string,
  linkTo: string,
  selected: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon, text, linkTo, selected
}) => {
  const baseStyle = "text-base flex gap-4 hover:text-gray-100 hover:bg-teal p-2 ";
  const colorVariants = {
    gray: "text-gray-700",
    color: "text-teal"
  };
  return (
    // TODO:  use Navlink instead, with activeclassname
    <NavLink
      // todo: use activeClassName
      className={baseStyle + (selected ? colorVariants.color : colorVariants.gray)}
      to={linkTo}>
      {icon}
      {text}
    </NavLink>
  );
};

export default SidebarItem;
