import type React from "react";

const FormError: React.FC<{ message?: string; className?: string }> = ({
  message,
  className,
}) => (
  <span
    role="alert"
    className={`absolute mt-0.5 text-xs text-red-700 ${className ?? ""}`}
  >
    {message ?? "This field is invalid."}
  </span>
);

export default FormError;
