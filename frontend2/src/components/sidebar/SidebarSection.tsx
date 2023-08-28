import React from "react";

interface SidebarSectionProps {
  children?: React.ReactNode;
  title?: string;
}

const SidebarSection: React.FC<SidebarSectionProps> = ({ children, title }) => {
  return (
    <div className="px-4">
      {title !== undefined && (
        <h2 className="mb-2 mx-auto font-light uppercase text-gray-500">
          {title}
        </h2>
      )}
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  );
};

export default SidebarSection;
