import React, { useState, useMemo } from "react";
import { EpisodeIdContext } from "./EpisodeContext";
import { DEFAULT_EPISODE } from "../utils/constants";

export const EpisodeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // episodeId is set by the EpisodeLayout component to the episode in the url
  const [episodeId, setEpisodeId] = useState<string>(DEFAULT_EPISODE);

  // avoid recreating context value if episode id hasn't changed
  const episodeIdContextValue = useMemo(
    () => ({ episodeId, setEpisodeId }),
    [episodeId, setEpisodeId],
  );

  return (
    <EpisodeIdContext.Provider value={episodeIdContextValue}>
      {children}
    </EpisodeIdContext.Provider>
  );
};
