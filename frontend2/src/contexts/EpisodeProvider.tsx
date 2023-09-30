import React, { useState, useEffect, useMemo } from "react";
import { type Episode } from "../utils/types";
import { EpisodeContext, EpisodeIdContext } from "./EpisodeContext";
import { DEFAULT_EPISODE } from "../utils/constants";
import { getEpisodeInfo } from "../utils/api/episode";

export const EpisodeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // episodeId is set by the EpisodeLayout component to the episode in the url
  const [episodeId, setEpisodeId] = useState<string>(DEFAULT_EPISODE);
  // on episodeId changes (or initial load), we will fetch information for the episode
  const [episode, setEpisode] = useState<Episode>();

  useEffect(() => {
    // used to avoid data races when loading episodes.
    let isActiveLookup = true;
    const loadEpisodeInfo = async (): Promise<void> => {
      try {
        console.log("episode id in loadEpisodeInfo:", episodeId);
        const episode = await getEpisodeInfo(episodeId);
        if (isActiveLookup) {
          setEpisode(episode);
        }
      } catch {
        console.error(`Could not load episode ${episodeId}`);
        if (isActiveLookup) {
          setEpisode(undefined);
        }
      }
    };

    setEpisode(undefined);
    void loadEpisodeInfo();
    return () => {
      // cleanup function ensures we don't load wrong episode data
      isActiveLookup = false;
    };
  }, [episodeId]);

  // avoid recreating context value if episode id hasn't changed
  const episodeIdContextValue = useMemo(
    () => ({
      episodeId,
      setEpisodeId,
    }),
    [episodeId, setEpisodeId],
  );

  return (
    <EpisodeIdContext.Provider value={episodeIdContextValue}>
      <EpisodeContext.Provider value={episode}>
        {children}
      </EpisodeContext.Provider>
    </EpisodeIdContext.Provider>
  );
};
