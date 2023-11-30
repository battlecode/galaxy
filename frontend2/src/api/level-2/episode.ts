import {
  type Episode,
  EpisodeApi,
  type GameMap,
  type Tournament,
  type PaginatedTournamentList,
  type PaginatedEpisodeList,
} from "../level-1";
import { DEFAULT_API_CONFIGURATION } from "./helpers";

/** This file contains all frontend episode api functions. */
const API = new EpisodeApi(DEFAULT_API_CONFIGURATION);

/**
 * Get the current episode's info.
 * @param episodeId The current episode's ID.
 */
export const getEpisodeInfo = async (episodeId: string): Promise<Episode> => {
  return await API.episodeERetrieve({ id: episodeId });
};

/**
 * Get a list of all Battlecode episodes.
 */
export const getAllEpisodes = async (): Promise<PaginatedEpisodeList> => {
  return await API.episodeEList();
};

/**
 * Get all maps for the provided episode.
 * @param episodeId The current episode's ID.
 */
export const getAllMaps = async (episodeId: string): Promise<GameMap[]> => {
  return await API.episodeMapList({ episodeId });
};

/**
 * Get the next tournament occurring during the given episode, as ordered by submission freeze time.
 * @param episodeId The current episode's ID.
 */
export const getNextTournament = async (
  episodeId: string,
): Promise<Tournament> => {
  return await API.episodeTournamentNextRetrieve({ episodeId });
};

/**
 * Get all of the tournaments occurring during the given episode.
 * @param episodeId The current episode's ID.
 * @param page The page of tournaments to get.
 */
export const getAllTournaments = async (
  episodeId: string,
  page?: number,
): Promise<PaginatedTournamentList> => {
  return await API.episodeTournamentList({ episodeId, page });
};

/**
 * Get the information of a specific tournament during the given episode.
 * @param episodeId The current episode's ID.
 * @param tournamentId The tournament's ID.
 */
export const getTournamentInfo = async (
  episodeId: string,
  tournamentId: string,
): Promise<Tournament> => {
  return await API.episodeTournamentRetrieve({
    episodeId,
    id: tournamentId,
  });
};
