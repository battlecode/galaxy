import React from "react";

const FormLabel: React.FC<{
  label?: string;
  required?: boolean;
  className?: string;
}> = ({ label, required = false, className }) => {
  return (
    <span
      className={`text-sm font-medium leading-6 text-gray-700 ${
        className ?? ""
      }`}
    >
      {label}
      {required && <span className="text-red-700"> *</span>}
    </span>
  );
};

export default FormLabel;
