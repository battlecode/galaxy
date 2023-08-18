import React from "react";
import Icon, { type IconName } from "./Icon";

interface ButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  variant?: string;
  label?: string;
  iconName?: IconName;
  fullWidth?: boolean;
  className?: string;
}

const variants: Record<string, string> = {
  "": "bg-gray-50 text-gray-800 hover:bg-gray-100 hover:ring-gray-900 hover:text-black ring-gray-500 ring-1 ring-inset",
  dark: "bg-cyan-700 text-white hover:bg-cyan-800",
};

const Button: React.FC<ButtonProps> = ({
  variant = "",
  label,
  iconName,
  fullWidth = false,
  className = "",
  ...rest
}) => {
  const variantStyle = `${variants[variant]}  ${
    fullWidth ? "w-full" : ""
  } ${className}`;
  return (
    <button
      // default button type
      type="button"
      className={`flex h-9 flex-row items-center justify-center gap-1.5 rounded px-2.5 py-1.5 font-medium shadow-sm ${variantStyle}`}
      {...rest}
    >
      {iconName !== undefined && <Icon name={iconName} size="sm" />}
      {label}
    </button>
  );
};

export default Button;
