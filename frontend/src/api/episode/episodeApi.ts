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
  type EpisodeTournamentRoundListRequest,
  type EpisodeTournamentInitializeCreateRequest,
  type PaginatedTournamentRoundList,
  type EpisodeTournamentRoundEnqueueCreateRequest,
  type EpisodeTournamentRoundReleaseCreateRequest,
  type EpisodeTournamentRoundRetrieveRequest,
  type TournamentRound,
  type EpisodeTournamentRoundRequeueCreateRequest,
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

/**
 * Get the information of a specific tournament round during the given episode.
 * @param episodeId The current episode's ID.
 * @param tournament The tournament's ID.
 * @param id The round's ID.
 */
export const getTournamentRoundInfo = async ({
  episodeId,
  tournament,
  id,
}: EpisodeTournamentRoundRetrieveRequest): Promise<TournamentRound> =>
  await API.episodeTournamentRoundRetrieve({
    episodeId,
    tournament,
    id,
  });

/**
 * Get the rounds of a specific tournament during the given episode.
 * @param episodeId The current episode's ID.
 * @param tournament The tournament's ID.
 * @param page The desired page to retrieve.
 */
export const getTournamentRoundList = async ({
  episodeId,
  tournament,
  page,
}: EpisodeTournamentRoundListRequest): Promise<PaginatedTournamentRoundList> =>
  await API.episodeTournamentRoundList({ episodeId, tournament, page });

/**
 * Initialize the requested tournament id the given episode.
 * @param episodeId The current episode's ID.
 * @param id The tournament's ID.
 */
export const initializeTournament = async ({
  episodeId,
  id,
}: EpisodeTournamentInitializeCreateRequest): Promise<void> => {
  await API.episodeTournamentInitializeCreate({ episodeId, id });
};

/**
 * Create and enqueue matches for the given tournament round.
 */
export const createAndEnqueueMatches = async ({
  episodeId,
  tournament,
  id,
  maps,
}: EpisodeTournamentRoundEnqueueCreateRequest): Promise<void> => {
  await API.episodeTournamentRoundEnqueueCreate({
    episodeId,
    tournament,
    id,
    maps,
  });
};

/**
 * Asynchronously release the given tournament round to the bracket service.
 */
export const releaseTournamentRound = async ({
  episodeId,
  tournament,
  id,
}: EpisodeTournamentRoundReleaseCreateRequest): Promise<void> => {
  await API.episodeTournamentRoundReleaseCreate({ episodeId, tournament, id });
};

/**
 * Asynchronously requeue the given tournament round's failed matches on Saturn.
 */
export const requeueTournamentRound = async ({
  episodeId,
  tournament,
  id,
}: EpisodeTournamentRoundRequeueCreateRequest): Promise<void> => {
  await API.episodeTournamentRoundRequeueCreate({ episodeId, tournament, id });
};
