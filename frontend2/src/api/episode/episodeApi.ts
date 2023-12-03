import {
  type Episode,
  EpisodeApi,
  type GameMap,
  type Tournament,
  type PaginatedTournamentList,
  type PaginatedEpisodeList,
  type EpisodeERetrieveRequest,
  type EpisodeMapListRequest,
  type EpisodeTournamentNextRetrieveRequest,
  type EpisodeTournamentListRequest,
  type EpisodeTournamentRetrieveRequest,
  type EpisodeEListRequest,
} from "../_autogen";
import { DEFAULT_API_CONFIGURATION } from "../helpers";

/** This file contains all frontend episode api functions. */
const API = new EpisodeApi(DEFAULT_API_CONFIGURATION);

/**
 * Get the given episode's info.
 * @param id The current episode's ID.
 */
export const getEpisodeInfo = async ({
  id,
}: EpisodeERetrieveRequest): Promise<Episode> =>
  await API.episodeERetrieve({ id });

/**
 * Get a paginated list of all Battlecode episodes.
 * @param page The page of episodes to get.
 */
export const getEpisodeList = async ({
  page,
}: EpisodeEListRequest): Promise<PaginatedEpisodeList> =>
  await API.episodeEList({ page });

/**
 * Get all maps for the provided episode.
 * @param episodeId The current episode's ID.
 */
export const getEpisodeMaps = async ({
  episodeId,
}: EpisodeMapListRequest): Promise<GameMap[]> =>
  await API.episodeMapList({ episodeId });

/**
 * Get the next tournament occurring during the given episode, as ordered by submission freeze time.
 * @param episodeId The current episode's ID.
 */
export const getNextTournament = async ({
  episodeId,
}: EpisodeTournamentNextRetrieveRequest): Promise<Tournament> =>
  await API.episodeTournamentNextRetrieve({ episodeId });

/**
 * Get a paginated list of the tournaments occurring during the given episode.
 * @param episodeId The current episode's ID.
 * @param page The page of tournaments to get.
 */
export const getTournamentList = async ({
  episodeId,
  page,
}: EpisodeTournamentListRequest): Promise<PaginatedTournamentList> =>
  await API.episodeTournamentList({ episodeId, page });

/**
 * Get the information of a specific tournament during the given episode.
 * @param episodeId The current episode's ID.
 * @param id The tournament's ID.
 */
export const getTournamentInfo = async ({
  episodeId,
  id,
}: EpisodeTournamentRetrieveRequest): Promise<Tournament> =>
  await API.episodeTournamentRetrieve({
    episodeId,
    id,
  });
