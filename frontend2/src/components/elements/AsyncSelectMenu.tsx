import { Combobox, Transition } from "@headlessui/react";
import React, { Fragment, useEffect, useState, useMemo } from "react";
import FormLabel from "./FormLabel";
import Icon from "./Icon";
import FormError from "./FormError";
import Spinner from "../Spinner";
import { debounce } from "lodash";

interface AsyncSelectMenuProps<T extends React.Key | null | undefined> {
  label?: string;
  required?: boolean;
  loadOptions: (
    inputValue: string,
  ) => Promise<Array<{ value: T; label: string }>>;
  value: T | null;
  placeholder?: string;
  className?: string;
  errorMessage?: string;
  onChange: (value: T | null) => void;
}

function AsyncSelectMenu<T extends React.Key | null | undefined>({
  label,
  required = false,
  loadOptions,
  value,
  placeholder,
  className = "",
  errorMessage,
  onChange,
}: AsyncSelectMenuProps<T>): JSX.Element {
  const [options, setOptions] = useState<Array<{ value: T; label: string }>>(
    [],
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState("");
  const invalid = errorMessage !== undefined;

  const handleChange = (inputValue: string): void => {
    setSearchText(inputValue);
  };

  const debouncedHandleChange = useMemo(() => debounce(handleChange, 300), []);

  const valueToLabel = useMemo(
    () => new Map(options.map((option) => [option.value, option.label])),
    [options],
  );

  useEffect(() => {
    return () => {
      debouncedHandleChange.cancel();
    };
  }, []);

  useEffect(() => {
    let active = true;
    const load = async (): Promise<void> => {
      setLoading(true);
      try {
        const result = await loadOptions(searchText);
        if (active) {
          setOptions(result);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [searchText]);

  return (
    <div className={`relative ${invalid ? "mb-2" : ""} ${className}`}>
      <Combobox value={value} onChange={onChange}>
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
          {!loading && (
            <div
              className="absolute inset-y-0 right-0 mr-2 flex transform items-center
              transition duration-300 ui-open:rotate-180"
            >
              <Icon name="chevron_down" size="sm" />
            </div>
          )}
          {loading && (
            <div className="absolute inset-y-0 right-0 mr-2 flex transform items-center">
              <Spinner size={4} />
            </div>
          )}
        </Combobox.Button>
        <Combobox.Input
          onChange={(event) => {
            debouncedHandleChange(event.target.value);
          }}
          placeholder={placeholder}
        />
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
              >
                <div className="overflow-x-auto pr-2">{option.label}</div>
                <span className=" hidden items-center text-cyan-900 ui-selected:flex">
                  {option.value === value && <Icon name="check" size="sm" />}
                </span>
              </Combobox.Option>
            ))}
          </Combobox.Options>
        </Transition>
      </Combobox>
      {invalid && <FormError message={errorMessage} />}
      {value !== null && (
        <div className="flex max-w-max flex-row items-center space-x-2 rounded bg-cyan-800 px-2 py-1 text-white">
          <span>{valueToLabel.get(value)}</span>
          <button
            onClick={() => {
              onChange(null);
            }}
            className="cursor-pointer items-center rounded hover:bg-cyan-200"
          >
            <Icon name="x_mark" size="sm" />
          </button>
        </div>
      )}
    </div>
  );
}

export default AsyncSelectMenu;
