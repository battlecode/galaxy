import React from "react";
import Icon, { type IconName } from "./Icon";

const VARIANTS: Record<string, string> = {
  "": "bg-gray-50 text-gray-800 hover:bg-gray-100 hover:ring-gray-900 hover:text-black ring-gray-500 ring-1 ring-inset",
  dark: "bg-cyan-700 text-white hover:bg-cyan-800",
  "light-outline":
    "ring-2 ring-inset ring-gray-200 text-gray-200 hover:bg-gray-100/20",
} as const;

interface ButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  variant?: string;
  label?: string;
  iconName?: IconName;
  fullWidth?: boolean;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  variant = "",
  label,
  iconName,
  fullWidth = false,
  className = "",
  ...rest
}) => {
  const variantStyle = `${VARIANTS[variant]}  ${
    fullWidth ? "w-full" : ""
  } ${className}`;
  return (
    <button
      // default button type
      type="button"
      className={`flex h-9 flex-row items-center justify-center gap-1.5 rounded px-2.5
        py-1.5 shadow-sm ${variantStyle} ${className}`}
      {...rest}
    >
      {iconName !== undefined && <Icon name={iconName} size="sm" />}
      {label}
    </button>
  );
};

export default Button;
