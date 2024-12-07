import type React from "react";
import { forwardRef } from "react";
import FormError from "./FormError";
import FormLabel from "./FormLabel";

interface TextAreaProps extends React.ComponentPropsWithoutRef<"textarea"> {
  label?: string;
  required?: boolean;
  className?: string;
  errorMessage?: string;
}

const Input = forwardRef<HTMLTextAreaElement, TextAreaProps>(function Input(
  { label, required = false, className = "", errorMessage, ...rest },
  ref,
) {
  const invalid = errorMessage !== undefined;
  return (
    <div className={`relative ${invalid ? "mb-1" : ""} ${className}`}>
      <label>
        <FormLabel label={label} required={required} />
        <div className="relative rounded-md shadow-sm">
          <textarea
            ref={ref}
            aria-invalid={errorMessage !== undefined ? "true" : "false"}
            className={`block w-full rounded-md border-0 px-2 py-1.5 text-gray-900 ring-1 ring-inset
            ring-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-inset
            focus:ring-cyan-600 sm:text-sm sm:leading-6
            ${invalid ? "ring-red-500" : ""}`}
            {...rest}
          />
        </div>
        {invalid && <FormError message={errorMessage} />}
      </label>
    </div>
  );
});

export default Input;
