import { createContext } from "react";
import { DEFAULT_EPISODE } from "../utils/constants";

export const EpisodeContext = createContext({
  // the default episode.
  episodeId: DEFAULT_EPISODE,
  setEpisodeId: (episodeId: string) => {
    console.log("default episode");
  },
});
