import { type Episode, EpisodeApi, type GameMap } from "../types";
import { DEFAULT_API_CONFIGURATION } from "./constants";

/** This file contains all frontend user api functions. */
const API = new EpisodeApi(DEFAULT_API_CONFIGURATION);

/**
 * Get the current episode's info.
 * @param episodeId The current episode's ID.
 */
export const getEpisodeInfo = async (episodeId: string): Promise<Episode> => {
  return await API.episodeERetrieve({ id: episodeId });
};

/**
 * Get all maps for the provided episode.
 * @param episodeId The current episode's ID.
 */
export const getAllMaps = async (episodeId: string): Promise<GameMap[]> => {
  return await API.episodeMapList({ episodeId });
};
