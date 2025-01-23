import type React from "react";
import { Fragment, useMemo } from "react";
import { Listbox, Transition } from "@headlessui/react";
import Icon from "./Icon";
import FormError from "./FormError";
import FormLabel from "./FormLabel";
import Spinner from "components/Spinner";
import { isPresent } from "utils/utilTypes";

interface SelectMenuProps<T extends React.Key | null | undefined> {
  options: Array<{ value: T; label: string | React.JSX.Element }>;
  loading?: boolean;
  disabled?: boolean;
  label?: string;
  required?: boolean;
  value?: T;
  placeholder?: string;
  className?: string;
  errorMessage?: string;
  onChange?: (value: T) => void;
}

const DISABLED = "bg-gray-200 ring-gray-200 text-gray-500 cursor-not-allowed";
const INVALID = "ring-red-500 text-gray-900";
const DEFAULT = "ring-gray-600 ring-cyan-600 text-gray-900";
const PLACEHOLDER = "ring-gray-400 text-gray-400";

function SelectMenu<T extends React.Key | null | undefined>({
  label,
  required = false,
  options,
  value,
  loading = false,
  disabled = false,
  placeholder,
  className = "",
  errorMessage,
  onChange,
}: SelectMenuProps<T>): React.JSX.Element {
  const valueToLabel = useMemo(
    () => new Map(options.map((option) => [option.value, option.label])),
    [options],
  );
  const invalid = errorMessage !== undefined;

  let stateStyle = DEFAULT;
  if (disabled) stateStyle = DISABLED;
  else if (invalid) stateStyle = INVALID;
  else if (value === undefined) stateStyle = PLACEHOLDER;

  return (
    <div className={`relative ${invalid ? "mb-2" : ""} ${className}`}>
      <Listbox value={value} onChange={onChange} disabled={disabled || loading}>
        <div className="relative">
          {label !== undefined && (
            <Listbox.Label>
              <FormLabel label={label} required={required} />
            </Listbox.Label>
          )}
          <Listbox.Button
            className={`relative h-9 w-full truncate rounded-md bg-white pl-3 pr-10
            text-left shadow-sm ring-1 ring-inset focus:outline-none focus:ring-1
            sm:text-sm sm:leading-6 ${stateStyle}`}
          >
            {!isPresent(value) ? placeholder : valueToLabel.get(value)}
            <div
              className="absolute inset-y-0 right-0 mr-2 flex transform items-center
              transition duration-300 ui-open:rotate-180 ui-not-open:rotate-0"
            >
              {loading ? (
                <Spinner size="xs" />
              ) : (
                <Icon name="chevron_down" size="sm" />
              )}
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
                  className="flex cursor-default flex-row justify-between py-1.5 pl-4 pr-2
                ui-selected:bg-cyan-100 ui-active:bg-cyan-100"
                  key={option.value}
                  value={option.value}
                >
                  <div className="overflow-x-auto pr-2">{option.label}</div>
                  {value === option.value && (
                    <span className="items-center text-cyan-900">
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

export default SelectMenu;
