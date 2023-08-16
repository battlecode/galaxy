import React, { useMemo, useState } from "react";
import { Listbox } from "@headlessui/react";
import Icon, { type IconName } from "./Icon";

interface SelectMenuProps<T extends React.Key | null | undefined> {
  options: Array<{ value: T; label: string }>;
  label?: string;
  required?: boolean;
  value?: T;
  placeholder?: string;
  onChange?: (value: T) => void;
}

function SelectMenu<T extends React.Key | null | undefined>({
  label,
  required = false,
  options,
  value,
  placeholder,
  onChange,
}: SelectMenuProps<T>): JSX.Element {
  const valueToLabel = useMemo(
    () => new Map(options.map((option) => [option.value, option.label])),
    [options]
  );
  return (
    <div className="flex flex-col gap-1">
      <Listbox value={value} onChange={onChange}>
        {label !== undefined && (
          <Listbox.Label className="flex flex-col gap-1 text-sm font-medium leading-6 text-gray-900">
            <span>
              {label}
              {required && <span className="text-red-700"> *</span>}
            </span>
          </Listbox.Label>
        )}
        <Listbox.Button className="h-9 relative w-full rounded-md truncate bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-1 focus:ring-cyan-600 ui-open:ring-cyan-600 sm:text-sm sm:leading-6">
          <span className={`${value === undefined ? "text-gray-400" : ""}`}>
            {value === undefined ? placeholder : valueToLabel.get(value)}
          </span>
          <div className="transition transform duration-300 ui-open:rotate-180 absolute inset-y-0 right-0 flex items-center mr-2">
            <Icon name="chevron_down" size="sm" />
          </div>
        </Listbox.Button>
        <Listbox.Options className="mt-0 max-h-56 w-full rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
          {options.map((option) => (
            <Listbox.Option
              className="px-4 relative py-1.5 cursor-default truncate ui-active:bg-cyan-100"
              key={option.value}
              value={option.value}
            >
              {option.label}
              <span className="hidden ui-selected:flex text-cyan-900 absolute inset-y-0 right-0 items-center pr-2">
                <Icon name="check" size="sm" />
              </span>
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </Listbox>
    </div>
  );
}

export default SelectMenu;
