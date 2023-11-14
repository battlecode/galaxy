import React, { Fragment, useMemo } from "react";
import { Listbox, Transition } from "@headlessui/react";
import Icon from "./elements/Icon";
import { useEpisodeId, useEpisodeList } from "../contexts/EpisodeContext";
import { isPresent } from "../utils/utilTypes";
import { useNavigate } from "react-router-dom";

const EpisodeSwitcher: React.FC = () => {
  const episodeList = useEpisodeList();
  const { episodeId, setEpisodeId } = useEpisodeId();
  const navigate = useNavigate();
  if (!isPresent(episodeList)) {
    return null;
  }
  const idToName = useMemo(
    () => new Map(episodeList.map((ep) => [ep.name_short, ep.name_long])),
    [episodeList],
  );
  return (
    <div className={`relative`}>
      <Listbox
        value={episodeId}
        onChange={(newEpisodeId) => {
          setEpisodeId(newEpisodeId);
          navigate(location.pathname.replace(episodeId, newEpisodeId));
        }}
      >
        <div className="relative">
          <Listbox.Button
            className={`relative h-9 w-full truncate rounded-full bg-gray-900/80 py-1.5
            pl-3.5 pr-8 text-left text-gray-100 shadow-sm focus:outline-none
            sm:text-sm sm:leading-6`}
          >
            <span className="text-sm font-semibold">
              {idToName.get(episodeId)}
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
              {episodeList.map((ep) => (
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
