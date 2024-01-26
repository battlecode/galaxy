import { createContext, useContext } from "react";

interface EpisodeIdContextType {
  episodeId: string;
  setEpisodeId: (episodeId: string) => void;
}

export const EpisodeIdContext = createContext<EpisodeIdContextType | null>(
  null,
);

// Use this function to retrieve and update the episodeId.
export const useEpisodeId = (): EpisodeIdContextType => {
  const episodeIdContext = useContext(EpisodeIdContext);
  if (episodeIdContext === null) {
    throw new Error("useEpisodeId has to be used within <EpisodeProvider>");
  }
  return episodeIdContext;
};
