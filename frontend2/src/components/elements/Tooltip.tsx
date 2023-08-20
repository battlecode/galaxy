import React from "react";

interface TooltipProps {
  children?: React.ReactNode;
  tooltip: string;
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({
  children,
  tooltip,
  className = "",
}) => {
  return (
    <div className={`${className}`}>
      {children}
      <div
        className="absolute -top-5 rounded-md bg-cyan-50 px-1.5 py-1 text-sm text-cyan-700 outline-1
        outline-cyan-500 sm:text-xs"
      >
        {tooltip}
      </div>
    </div>
  );
};

export default Tooltip;
