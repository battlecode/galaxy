import React from "react";
import Icon from "./Icon";
import Tooltip from "./Tooltip";

const FormLabel: React.FC<{
  label?: string;
  required?: boolean;
  className?: string;
  tooltip?: string;
}> = ({ label, required = false, className, tooltip }) => {
  return (
    <div
      className={`flex flex-row items-center gap-1 text-sm font-medium leading-6 text-gray-700 ${
        className ?? ""
      }`}
    >
      {label}
      {required && <span className="text-red-700"> *</span>}
      {tooltip !== undefined && (
        <Tooltip tooltip={tooltip}>
          <Icon
            className="ml-0.5 mt-0.5 inline text-gray-400"
            size="xs"
            name="information_circle"
          />
        </Tooltip>
      )}
    </div>
  );
};

export default FormLabel;
