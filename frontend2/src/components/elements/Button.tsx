import React from "react";

interface ButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  variant?: string;
  label?: string;
}

const variants: Record<string, string> = {
  "": "bg-gray-50 text-gray-900 hover:bg-gray-100 ring-gray-300 ring-1 ring-inset",
  dark: "bg-gray-700 text-gray-50 hover:bg-gray-800",
};

const Button: React.FC<ButtonProps> = ({ variant, label, ...rest }) => {
  variant = variant ?? "";
  const variantStyle = variants[variant];
  return (
    <button
      // default button type
      type="button"
      className={`rounded-md px-2.5 py-1.5 text-sm font-semibold shadow-sm ${variantStyle}`}
      {...rest}
    >
      {label}
    </button>
  );
};

export default Button;
