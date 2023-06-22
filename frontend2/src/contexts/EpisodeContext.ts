import { createContext } from "react";

export const EpisodeContext = createContext({
  // the default episode.
  episode: "bc23",
  setEpisode: (episode: string) => {
    console.log("default episode");
  },
});
