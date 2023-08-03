import React, { forwardRef } from "react";

interface InputProps extends React.ComponentPropsWithoutRef<"input"> {
  label?: string;
  required?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, required, ...rest },
  ref
) {
  required = required ?? false;
  return (
    <div className="w-full">
      {label !== undefined && (
        <label className="flex flex-col w-full gap-1 text-sm font-medium leading-6 text-gray-900">
          <span>
            {label}
            {required && <span className="text-red-700"> *</span>}
          </span>
        </label>
      )}
      <div className="relative rounded-md shadow-sm">
        <input
          ref={ref}
          className="block w-full rounded-md border-0 py-1.5 px-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-gray-700 sm:text-sm sm:leading-6"
          {...rest}
        />
      </div>
    </div>
  );
});

export default Input;
