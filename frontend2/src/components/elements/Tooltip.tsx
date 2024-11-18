import type React from "react";

// Example usage
// <Tooltip text="This will be displayed inside the tooltip" location="left">
//   <p>Hovering this makes the tooltip appear</p>
// </Tooltip>

interface TooltipProps {
  children?: React.ReactNode;
  text: string;
  delay?: number;
  location?: "top" | "bottom" | "left" | "right";
}

const TOOLTIP_CLASSES = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
};
const TOOLTIP_TRIANGLE_CLASSES = {
  top: "-bottom-1 left-1/2 -translate-x-1/2",
  bottom: "-top-1 left-1/2 -translate-x-1/2",
  left: "-right-1 top-1/2 -translate-y-1/2",
  right: "-left-1 top-1/2 -translate-y-1/2",
};

const HOVER_DELAY_MILLIS = 400;

const Tooltip: React.FC<TooltipProps> = ({
  children,
  // the string to display inside the tooltip
  text,
  // delay between hover and tooltip appearance
  delay = HOVER_DELAY_MILLIS,
  // the location that the tooltip will appear (relative to the children)
  location = "top",
}) => (
  <div className={`group relative h-max w-max`}>
    {children}
    <div
      className={`pointer-events-none absolute z-20 mb-1 w-max max-w-[200px] rounded bg-gray-800 px-2 py-1
        text-center text-sm text-gray-50 opacity-0 transition-opacity delay-0 group-hover:opacity-100
        group-hover:delay-[${delay}ms] ${TOOLTIP_CLASSES[location]}`}
    >
      {text}
      <div
        className={`absolute z-20 h-2.5 w-2.5 rotate-45 transform
          bg-gray-800 ${TOOLTIP_TRIANGLE_CLASSES[location]}`}
      />
    </div>
  </div>
);

export default Tooltip;
