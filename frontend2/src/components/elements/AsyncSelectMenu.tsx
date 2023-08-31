import { Combobox, Transition } from "@headlessui/react";
import React, { Fragment, useMemo, useState } from "react";
import FormLabel from "./FormLabel";
import Icon from "./Icon";
import FormError from "./FormError";
import Spinner from "../Spinner";

interface AsyncSelectMenuProps<T extends React.Key | null | undefined> {
  label?: string;
  required?: boolean;
  options: Array<{ value: T; label: string }>;
  loadOptions: (inputValue: string) => Promise<void> | undefined;
  loading?: boolean;
  value: T | null;
  placeholder?: string;
  className?: string;
  errorMessage?: string;
  onChange: (value: T | null) => void;
}

function AsyncSelectMenu<T extends React.Key | null | undefined>({
  label,
  required = false,
  options,
  loadOptions,
  loading = false,
  value,
  placeholder,
  className = "",
  errorMessage,
  onChange,
}: AsyncSelectMenuProps<T>): JSX.Element {
  const [searchText, setSearchText] = useState("");
  const invalid = errorMessage !== undefined;

  return (
    <div className={`relative ${invalid ? "mb-2" : ""} ${className}`}>
      <Combobox value={value} onChange={onChange}>
        <div className="relative">
          {label !== undefined && (
            <Combobox.Label>
              <FormLabel label={label} required={required} />
            </Combobox.Label>
          )}
          <Combobox.Button
            className={`relative h-10 w-full truncate rounded-md bg-white
            pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300
            focus:outline-none focus:ring-1 focus:ring-cyan-600 ui-open:ring-cyan-600
            sm:text-sm sm:leading-6 ${invalid ? "ring-red-500" : ""}`}
          >
            <div className="flex h-full w-full flex-row items-center justify-between">
              <Combobox.Input
                className="h-full w-4/5 bg-transparent ring-transparent"
                onChange={(event) => {
                  setSearchText(event.target.value);
                  try {
                    void loadOptions(searchText);
                  } catch (err) {
                    console.error(err);
                  }
                }}
                defaultValue={placeholder}
                value={searchText}
              />
              {!loading && value !== null && (
                <button
                  onClick={(ev) => {
                    onChange(null);
                    setSearchText("");
                  }}
                  className="cursor-pointer items-center rounded hover:bg-gray-200"
                >
                  <Icon name="x_mark" size="sm" />
                </button>
              )}
              {loading && <Spinner size={4} />}
            </div>

            <div
              className="absolute inset-y-0 right-0 mr-2 flex transform items-center
              transition duration-300 ui-open:rotate-180"
            >
              <Icon name="chevron_down" size="sm" />
            </div>
          </Combobox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Combobox.Options
              className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md
              bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none
              sm:max-h-60 sm:text-sm"
            >
              {options.map((option) => (
                <Combobox.Option
                  className={`flex cursor-default flex-row justify-between py-1.5 pl-4 pr-2 ${
                    option.value === value ? "bg-cyan-100" : ""
                  } ui-active:bg-cyan-100`}
                  key={option.value}
                  value={option.value}
                  onClick={(ev) => {
                    ev.preventDefault();
                    onChange(option.value);
                    setSearchText(option.label);
                  }}
                >
                  <div className="overflow-x-auto pr-2">{option.label}</div>
                  <span className=" hidden items-center text-cyan-900 ui-selected:flex">
                    {option.value === value && <Icon name="check" size="sm" />}
                  </span>
                </Combobox.Option>
              ))}
            </Combobox.Options>
          </Transition>
        </div>
      </Combobox>
      {invalid && <FormError message={errorMessage} />}
    </div>
  );
}

export default AsyncSelectMenu;
