import React, { useMemo, useState } from "react";
import { Listbox } from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/24/outline";

interface DropdownProps {
  label: string;
  options: Array<{ value: string; label: string }>;
  required?: boolean;
  value: string | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  label,
  required = false,
  options,
  value,
  placeholder,
  onChange,
}) => {
  const optionToValue = useMemo(
    () => new Map(options.map((option) => [option.value, option.label])),
    [options]
  );
  return (
    <div className="flex flex-col gap-2">
      <Listbox value={value} onChange={onChange}>
        <Listbox.Label className="flex flex-col gap-1 text-sm font-medium leading-6 text-gray-900">
          <span>
            {label}
            {required && <span className="text-red-700"> *</span>}
          </span>
        </Listbox.Label>
        <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6">
          {value === undefined ? placeholder : optionToValue.get(value)}
        </Listbox.Button>
        <Listbox.Options className="mt-0 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
          {options.map((option) => (
            <Listbox.Option key={option.value} value={option.value}>
              {option.label}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </Listbox>
    </div>
  );
};

export default Dropdown;
