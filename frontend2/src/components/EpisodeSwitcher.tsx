import type React from "react";
import { Fragment, useMemo } from "react";
import { Listbox, Transition } from "@headlessui/react";
import Icon from "./elements/Icon";
import { useEpisodeId } from "../contexts/EpisodeContext";
import { isPresent } from "../utils/utilTypes";
import { useNavigate } from "react-router-dom";
import { useEpisodeInfo, useEpisodeList } from "../api/episode/useEpisode";
import { useQueryClient } from "@tanstack/react-query";
import Spinner from "./Spinner";

const EpisodeSwitcher: React.FC = () => {
  const queryClient = useQueryClient();
  const { episodeId, setEpisodeId } = useEpisodeId();
  const episodeList = useEpisodeList({ page: 1 }, queryClient);
  const episodeInfo = useEpisodeInfo({ id: episodeId });
  const navigate = useNavigate();
  const idToName = useMemo(
    () =>
      new Map(
        (episodeList.data?.results ?? []).map((ep) => [
          ep.name_short,
          ep.name_long,
        ]),
      ),
    [episodeList],
  );

  if (!isPresent(episodeList)) {
    return null;
  }
  return (
    <div className={`relative`}>
      <Listbox
        value={episodeId}
        onChange={(newEpisodeId) => {
          setEpisodeId(newEpisodeId);
          navigate(`/${newEpisodeId}/home`);
        }}
      >
        <div className="relative">
          <Listbox.Button
            className={`relative flex h-9 w-full flex-row items-center justify-center gap-3 truncate rounded-full bg-gray-900/80 py-1.5
            pl-3.5 pr-8 text-left text-gray-100 shadow-sm focus:outline-none
            sm:text-sm sm:leading-6`}
          >
            <span className="text-sm font-semibold">
              {idToName.get(episodeId)}
            </span>
            {(episodeList.isLoading || episodeInfo.isLoading) && (
              <div className="my-1 flex w-full justify-center">
                <Spinner size="xs" />
              </div>
            )}
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
              {episodeList.data?.results?.map((ep) => (
                <Listbox.Option
                  className="flex cursor-default flex-row justify-between py-1.5 pl-4 pr-2 ui-active:bg-cyan-100"
                  key={ep.name_short}
                  value={ep.name_short}
                >
                  <div className="overflow-x-auto pr-2">{ep.name_long}</div>
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
};

export default EpisodeSwitcher;
