import { createContext, useContext } from "react";
import { type Episode } from "../utils/types";
import { type Maybe } from "../utils/utilTypes";

interface EpisodeIdContextType {
  episodeId: string;
  setEpisodeId: (episodeId: string) => void;
}

export const EpisodeContext = createContext<Maybe<Episode>>(undefined);
export const EpisodeIdContext = createContext<EpisodeIdContextType | null>(
  null,
);
export const EpisodeListContext = createContext<Maybe<Episode[]>>(undefined);

// Use this function to retrieve full episode information. If the api call to
// retrieve full episode information has not completed, then
// episodeContext.episode will be undefined.
export const useEpisode = (): Maybe<Episode> => {
  return useContext(EpisodeContext);
};

// Use this function to retrieve and update the episodeId.
export const useEpisodeId = (): EpisodeIdContextType => {
  const episodeIdContext = useContext(EpisodeIdContext);
  if (episodeIdContext === null) {
    throw new Error("useEpisodeId has to be used within <EpisodeProvider>");
  }
  return episodeIdContext;
};

/** Use this function to retrieve all episodes. */
export const useEpisodeList = (): Maybe<Episode[]> => {
  return useContext(EpisodeListContext);
};
