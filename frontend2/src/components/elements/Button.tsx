import type React from "react";
import Icon, { type IconName } from "./Icon";
import Spinner from "../Spinner";

const VARIANTS = {
  "": "bg-gray-50 text-gray-800 hover:bg-gray-100 hover:ring-gray-900 hover:text-black ring-gray-500 ring-1 ring-inset",
  dark: "bg-cyan-700 text-white hover:bg-cyan-800",
  danger: "bg-red-700 text-white hover:bg-red-800",
  "danger-outline":
    "bg-red-50 text-red-800 hover:bg-red-100 hover:ring-red-700 ring-red-500 ring-1 ring-inset",
  "light-outline":
    "ring-2 ring-inset ring-gray-200 text-gray-200 hover:bg-gray-100/20",
  "no-outline": "text-gray-800 px-0 py-0 hover:bg-gray-100/20",
} as const;

type VariantType = keyof typeof VARIANTS;

const DISABLED = "bg-gray-200 text-gray-500 cursor-not-allowed";

interface ButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  variant?: VariantType;
  disabled?: boolean;
  loading?: boolean;
  label?: string;
  iconName?: IconName;
  fullWidth?: boolean;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  variant = "",
  disabled = false,
  loading = false,
  label,
  iconName,
  fullWidth = false,
  className = "",
  ...rest
}) => {
  const variantStyle = `${disabled ? DISABLED : VARIANTS[variant]} ${
    fullWidth ? "w-full" : ""
  } ${className}`;
  return (
    <button
      // default button type
      type="button"
      disabled={disabled || loading}
      className={`flex h-9 flex-row items-center justify-center gap-1.5 rounded px-2.5
        py-1.5 shadow-sm ${variantStyle} ${className}`}
      {...rest}
    >
      {iconName !== undefined && <Icon name={iconName} size="sm" />}
      {loading ? (
        <Spinner
          className="mx-2"
          variant={
            variant === "danger" || variant === "danger-outline" ? "danger" : ""
          }
          size="sm"
        />
      ) : (
        label
      )}
    </button>
  );
};

export default Button;
