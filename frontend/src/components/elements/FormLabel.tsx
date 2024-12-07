import type React from "react";

const FormLabel: React.FC<{
  label?: string;
  required?: boolean;
  className?: string;
}> = ({ label, required = false, className }) => (
  <div
    className={`flex flex-row items-center gap-1 text-sm leading-6 text-gray-700 ${
      className ?? ""
    }`}
  >
    {label}
    {required && <span className="text-red-700"> *</span>}
  </div>
);

export default FormLabel;
