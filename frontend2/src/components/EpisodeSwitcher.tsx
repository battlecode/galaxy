import React, { Fragment, useMemo } from "react";
import { Listbox, Transition } from "@headlessui/react";
import Icon from "./elements/Icon";

interface EpisodeSwitcherProps<T extends React.Key | null | undefined> {
  options: Array<{ value: T; label: string }>;
  value: T;
  onChange?: (value: T) => void;
}

function EpisodeSwitcher<T extends React.Key | null | undefined>({
  options,
  value,
  onChange,
}: EpisodeSwitcherProps<T>): JSX.Element {
  const valueToLabel = useMemo(
    () => new Map(options.map((option) => [option.value, option.label])),
    [options],
  );
  return (
    <div className={`relative`}>
      <Listbox value={value} onChange={onChange}>
        <div className="relative">
          <Listbox.Button
            className={`relative h-9 w-full truncate rounded-full bg-gray-900/80 py-1.5
            pl-3.5 pr-8 text-left text-gray-200 shadow-sm focus:outline-none
            sm:text-sm sm:leading-6`}
          >
            <span className="text-sm font-semibold">
              {valueToLabel.get(value)}
            </span>
            <div
              className="absolute inset-y-0 right-0 mr-2 flex transform items-center
              transition duration-300 ui-open:rotate-180"
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
                  <span className=" hidden items-center text-cyan-900 ui-selected:flex">
                    <Icon name="check" size="sm" />
                  </span>
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
}

export default EpisodeSwitcher;
