import { createContext } from "react";
import { DEFAULT_EPISODE } from "../utils/constants";

export const EpisodeContext = createContext({
  // the default episode.
  episode: DEFAULT_EPISODE,
  setEpisode: (episode: string) => {
    console.log("default episode");
  },
});
