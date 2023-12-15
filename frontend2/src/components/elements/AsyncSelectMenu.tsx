import { Combobox, Transition } from "@headlessui/react";
import React, { Fragment, useEffect, useState, useMemo } from "react";
import FormLabel from "./FormLabel";
import Icon from "./Icon";
import Spinner from "../Spinner";
import { debounce } from "lodash";
import {
  type UseQueryResult,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { useEpisodeId } from "../../contexts/EpisodeContext";

interface SearchParams {
  episodeId: string;
  search: string;
  page: number;
}

interface SearchResult<K> {
  results?: K[];
}

interface AsyncSelectMenuProps<T extends React.Key | null | undefined, K> {
  useQueryResult: (
    { episodeId, search, page }: SearchParams,
    queryClient: QueryClient,
  ) => UseQueryResult<SearchResult<K>, Error>;
  resultToOptions: (results: K[]) => Array<{ value: T; label: string }>;
  onChange: (selection: { value: T; label: string } | null) => void;
  selected: { value: T; label: string } | null;
  label?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
}

function AsyncSelectMenu<T extends React.Key | null | undefined, K>({
  onChange,
  useQueryResult,
  resultToOptions,
  label,
  required = false,
  selected,
  placeholder,
  className = "",
}: AsyncSelectMenuProps<T, K>): JSX.Element {
  const { episodeId } = useEpisodeId();
  const queryClient = useQueryClient();

  const [searchText, setSearchText] = useState("");

  const queryData = useQueryResult(
    { episodeId, search: searchText, page: 1 },
    queryClient,
  );

  const options = useMemo(
    () => resultToOptions(queryData.data?.results ?? []),
    [queryData.data],
  );

  const handleChange = (inputValue: string): void => {
    setSearchText(inputValue);
  };

  const debouncedHandleChange = useMemo(() => debounce(handleChange, 300), []);

  useEffect(() => {
    return () => {
      debouncedHandleChange.cancel();
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      <Combobox value={selected} onChange={onChange}>
        {label !== undefined && (
          <Combobox.Label>
            <FormLabel label={label} required={required} />
          </Combobox.Label>
        )}
        <div
          className={`
          relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left
          shadow-sm
          sm:text-sm
          `}
        >
          <Combobox.Input
            className={`w-full border-none py-2 pl-3 ${
              selected !== null ? "pr-14" : "pr-8"
            } text-sm leading-5 text-gray-900 focus:ring-0`}
            onChange={(event) => {
              debouncedHandleChange(event.target.value);
            }}
            placeholder={placeholder}
            displayValue={(selection: { value: T; label: string } | null) => {
              return selection !== null ? selection.label : "";
            }}
          />
          {selected !== null && (
            <button
              className="absolute inset-y-0 right-0 mr-8 flex transform items-center
              text-red-700 transition duration-300 ui-open:rotate-180"
              onClick={() => {
                onChange(null);
              }}
            >
              <Icon name="x_mark" size="xs" />
            </button>
          )}
          <Combobox.Button>
            <div
              className="absolute inset-y-0 right-0 mr-2 flex transform items-center
              transition duration-300 ui-open:rotate-180"
            >
              <Icon name="chevron_down" size="sm" />
            </div>
          </Combobox.Button>
        </div>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Combobox.Options
            className="absolute z-10 ml-0 mt-1 max-h-48 w-full overflow-auto rounded-md
              bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none
              sm:max-h-60 sm:text-sm"
          >
            {queryData.isLoading && (
              <div className="my-1 flex w-full justify-center">
                <Spinner size="xs" />
              </div>
            )}
            {options.map((option) => (
              <Combobox.Option
                className={`flex cursor-default flex-row justify-between py-1.5 pl-4 pr-2
                ui-selected:bg-cyan-100 ui-active:bg-cyan-100`}
                key={option.value}
                value={option}
              >
                <div className="overflow-x-auto pr-2">{option.label}</div>
                <span className=" hidden items-center text-cyan-900 ui-selected:flex">
                  <Icon name="check" size="sm" />
                </span>
              </Combobox.Option>
            ))}
            {!queryData.isLoading && options.length === 0 && (
              <div className="px-3 py-1 text-gray-600">No results found.</div>
            )}
          </Combobox.Options>
        </Transition>
      </Combobox>
    </div>
  );
}

export default AsyncSelectMenu;
