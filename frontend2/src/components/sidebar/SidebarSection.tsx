import React from "react";

interface SidebarSectionProps {
  children?: React.ReactNode;
  title?: string;
}

const SidebarSection: React.FC<SidebarSectionProps> = ({ children, title }) => {
  return (
    <div className="pl-5 pr-8">
      {title !== undefined && (
        <h2 className="uppercase text-gray-500 tracking-wider text-sm mb-3">
          {title}
        </h2>
      )}
      <div className="flex flex-col gap-5">{children}</div>
    </div>
  );
};

export default SidebarSection;
