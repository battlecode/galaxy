import { Listbox, Transition } from "@headlessui/react";
import type React from "react";
import { Fragment, useMemo } from "react";
import FormLabel from "./FormLabel";
import Pill from "./Pill";
import Icon from "./Icon";
import FormError from "./FormError";

interface SelectMultipleMenuProps<T extends React.Key | null | undefined> {
  options: Array<{ value: T; label: string | React.JSX.Element }>;
  disabled?: boolean;
  label?: string;
  required?: boolean;
  value?: T[];
  placeholder?: string;
  className?: string;
  errorMessage?: string;
  onChange?: (value: T[]) => void;
}

const DISABLED = "bg-gray-200 ring-gray-200 text-gray-500 cursor-not-allowed";
const INVALID = "ring-red-500 text-gray-900";
const DEFAULT = "ring-gray-600 ring-cyan-600 text-gray-900";
const PLACEHOLDER = "ring-gray-400 text-gray-400";

function SelectMultipleMenu<T extends React.Key | null | undefined>({
  label,
  required = false,
  options,
  disabled = false,
  value,
  placeholder,
  className = "",
  errorMessage,
  onChange,
}: SelectMultipleMenuProps<T>): React.JSX.Element {
  const valueToLabel = useMemo(
    () => new Map(options.map((option) => [option.value, option.label])),
    [options],
  );
  const removeOption = (option: T): void => {
    if (value === undefined || onChange === undefined) return;
    onChange(value.filter((v) => v !== option));
  };
  const invalid = errorMessage !== undefined;

  let stateStyle = DEFAULT;
  if (disabled) stateStyle = DISABLED;
  else if (invalid) stateStyle = INVALID;
  else if (value === undefined || value.length === 0) stateStyle = PLACEHOLDER;

  return (
    <div className={`relative ${invalid ? "mb-4" : ""} ${className}`}>
      <Listbox value={value} onChange={onChange} multiple disabled={disabled}>
        <div className="relative">
          {label !== undefined && (
            <Listbox.Label>
              <FormLabel label={label} required={required} />
            </Listbox.Label>
          )}
          <Listbox.Button
            className={`ring-insetfocus:outline-none relative flex w-full flex-row
            items-center rounded-md bg-white py-1.5 pl-3 pr-2 shadow-sm ring-1 focus:ring-1
            sm:text-sm sm:leading-6 ${stateStyle}`}
          >
            <div className={`flex h-full w-full flex-row flex-wrap gap-2`}>
              {value === undefined || value.length === 0
                ? placeholder
                : value.map((v) => (
                    <Pill
                      key={v}
                      label={valueToLabel.get(v) ?? ""}
                      deletable
                      onDelete={() => {
                        removeOption(v);
                      }}
                    />
                  ))}
            </div>
            <div
              className="flex transform items-center
              transition duration-300 ui-open:rotate-180 ui-not-open:rotate-0"
            >
              <Icon name="chevron_down" size="sm" />
            </div>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options
              className="absolute z-10 ml-0 mt-1 max-h-48 w-full overflow-auto rounded-md
              bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none
              sm:max-h-60 sm:text-sm"
            >
              {options.map((option) => (
                <Listbox.Option
                  className="flex cursor-default flex-row justify-between py-1.5 pl-4 pr-2 ui-active:bg-cyan-100"
                  key={option.value}
                  value={option.value}
                >
                  <div className="overflow-x-auto pr-2">{option.label}</div>
                  {value !== undefined &&
                    value.some((opt) => opt === option.value) && (
                      <span className="hidden items-center text-cyan-900 ui-selected:flex">
                        <Icon name="check" size="sm" />
                      </span>
                    )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
      {invalid && <FormError message={errorMessage} />}
    </div>
  );
}

export default SelectMultipleMenu;
