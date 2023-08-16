import React from "react";
import Icon, { type IconName } from "./Icon";

interface ButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  variant?: string;
  label?: string;
  iconName?: IconName;
}

const variants: Record<string, string> = {
  "": "bg-gray-50 text-gray-800 hover:bg-gray-100 hover:ring-gray-900 hover:text-black ring-gray-500 ring-1 ring-inset",
  dark: "bg-cyan-700 text-white hover:bg-cyan-800",
};

const Button: React.FC<ButtonProps> = ({
  variant,
  label,
  iconName,
  ...rest
}) => {
  variant = variant ?? "";
  const variantStyle = variants[variant];
  return (
    <button
      // default button type
      type="button"
      className={`flex flex-row gap-1.5 items-center justify-center rounded h-9 px-2.5 py-1.5 font-medium shadow-sm ${variantStyle}`}
      {...rest}
    >
      {iconName !== undefined && <Icon name={iconName} size="sm"/>}
      {label}
    </button>
  );
};

export default Button;
