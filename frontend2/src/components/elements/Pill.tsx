import React from "react";
import Icon from "./Icon";

interface PillProps {
  text: string;
  deletable?: boolean;
  onDelete?: (ev?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  className?: string;
}

const Pill: React.FC<PillProps> = ({
  text,
  deletable = false,
  onDelete,
  className = "",
}) => {
  return (
    <div
      className={`gap flex max-w-max flex-row items-center justify-center gap-x-1 rounded-full bg-cyan-50 py-1 pl-3 pr-2 text-sm text-cyan-700 ring-1 ring-inset ring-cyan-600/20 ${className}`}
    >
      <span>{text}</span>
      {deletable && (
        <button
          onClick={(ev) => {
            onDelete?.(ev);
            ev.stopPropagation();
          }}
          className="cursor-pointer items-center rounded "
        >
          <Icon name="x_mark" size="xs" />
        </button>
      )}
    </div>
  );
};

export default Pill;
