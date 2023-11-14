import React, { useState, useEffect, useMemo } from "react";
import { type Episode } from "../utils/types";
import {
  EpisodeContext,
  EpisodeIdContext,
  EpisodeListContext,
} from "./EpisodeContext";
import { DEFAULT_EPISODE } from "../utils/constants";
import { getAllEpisodes, getEpisodeInfo } from "../utils/api/episode";
import type { Maybe } from "../utils/utilTypes";

export const EpisodeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // episodeId is set by the EpisodeLayout component to the episode in the url
  const [episodeId, setEpisodeId] = useState<string>(DEFAULT_EPISODE);
  // on episodeId changes (or initial load), we will fetch information for the episode
  const [episode, setEpisode] = useState<Episode>();
  // on initial load, we will fetch the list of all episodes.
  const [episodeList, setEpisodeList] = useState<Maybe<Episode[]>>(undefined);

  useEffect(() => {
    // used to avoid data races when loading episodes.
    let isActiveLookup = true;
    const loadEpisodeInfo = async (): Promise<void> => {
      try {
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

  useEffect(() => {
    let isActiveLookup = true;

    const fetchEpisodes = async (): Promise<void> => {
      try {
        const result = await getAllEpisodes();
        if (isActiveLookup) {
          setEpisodeList(result.results);
        }
      } catch (err) {
        if (isActiveLookup) {
          setEpisodeList(undefined);
        }
        console.error(err);
      }
    };

    setEpisodeList(undefined);
    void fetchEpisodes();
    return () => {
      isActiveLookup = false;
    };
  }, []);

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
        <EpisodeListContext.Provider value={episodeList}>
          {children}
        </EpisodeListContext.Provider>
      </EpisodeContext.Provider>
    </EpisodeIdContext.Provider>
  );
};
