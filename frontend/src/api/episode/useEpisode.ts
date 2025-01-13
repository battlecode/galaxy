import {
  type UseQueryResult,
  useQuery,
  type QueryClient,
  useMutation,
  type UseMutationResult,
} from "@tanstack/react-query";
import type {
  Episode,
  EpisodeEListRequest,
  EpisodeERetrieveRequest,
  EpisodeMapListRequest,
  EpisodeTournamentInitializeCreateRequest,
  EpisodeTournamentListRequest,
  EpisodeTournamentNextRetrieveRequest,
  EpisodeTournamentRetrieveRequest,
  EpisodeTournamentRoundEnqueueCreateRequest,
  EpisodeTournamentRoundListRequest,
  EpisodeTournamentRoundReleaseCreateRequest,
  EpisodeTournamentRoundRetrieveRequest,
  GameMap,
  PaginatedEpisodeList,
  PaginatedTournamentList,
  PaginatedTournamentRoundList,
  ResponseError,
  Tournament,
  TournamentRound,
} from "../_autogen";
import { buildKey } from "../helpers";
import {
  episodeInfoFactory,
  episodeListFactory,
  episodeMapsFactory,
  nextTournamentFactory,
  tournamentInfoFactory,
  tournamentListFactory,
  tournamentRoundInfoFactory,
  tournamentRoundListFactory,
} from "./episodeFactories";
import { MILLIS_SECOND, SECONDS_MINUTE } from "utils/utilTypes";
import { episodeMutationKeys, episodeQueryKeys } from "./episodeKeys";
import {
  createAndEnqueueMatches,
  initializeTournament,
  releaseTournamentRound,
} from "./episodeApi";
import toast from "react-hot-toast";

// ---------- QUERY HOOKS ---------- //
const EPISODE_WAIT_TIME = 5;

/**
 * For retrieving the given episode's info.
 */
export const useEpisodeInfo = ({
  id,
}: EpisodeERetrieveRequest): UseQueryResult<Episode> =>
  useQuery({
    queryKey: buildKey(episodeInfoFactory.queryKey, { id }),
    queryFn: async () => await episodeInfoFactory.queryFn({ id }),
    staleTime: EPISODE_WAIT_TIME * MILLIS_SECOND * SECONDS_MINUTE,
  });

/**
 * For retrieving a paginated list of Battlecode episodes.
 */
export const useEpisodeList = (
  { page }: EpisodeEListRequest,
  queryClient: QueryClient,
): UseQueryResult<PaginatedEpisodeList> =>
  useQuery({
    queryKey: buildKey(episodeListFactory.queryKey, { page }),
    queryFn: async () =>
      await episodeListFactory.queryFn({ page }, queryClient, true),
    staleTime: Infinity,
  });

/**
 * For retrieving the maps of the given episode.
 */
export const useEpisodeMaps = ({
  episodeId,
}: EpisodeMapListRequest): UseQueryResult<GameMap[]> =>
  useQuery({
    queryKey: buildKey(episodeMapsFactory.queryKey, { episodeId }),
    queryFn: async () => await episodeMapsFactory.queryFn({ episodeId }),
  });

/**
 * For retrieving the next tournament occurring during the given episode.
 */
export const useNextTournament = ({
  episodeId,
}: EpisodeTournamentNextRetrieveRequest): UseQueryResult<Tournament | null> =>
  useQuery({
    queryKey: buildKey(nextTournamentFactory.queryKey, { episodeId }),
    queryFn: async () => await nextTournamentFactory.queryFn({ episodeId }),
  });

/**
 * For retrieving a paginated list of the tournaments occurring during the given episode.
 */
export const useTournamentList = (
  { episodeId, page }: EpisodeTournamentListRequest,
  queryClient: QueryClient,
): UseQueryResult<PaginatedTournamentList> =>
  useQuery({
    queryKey: buildKey(tournamentListFactory.queryKey, { episodeId, page }),
    queryFn: async () =>
      await tournamentListFactory.queryFn(
        { episodeId, page },
        queryClient,
        true,
      ),
  });

/**
 * For retrieving the information of a specific tournament occurring during the given episode.
 */
export const useTournamentInfo = ({
  episodeId,
  id,
}: EpisodeTournamentRetrieveRequest): UseQueryResult<Tournament> =>
  useQuery({
    queryKey: buildKey(tournamentInfoFactory.queryKey, { episodeId, id }),
    queryFn: async () => await tournamentInfoFactory.queryFn({ episodeId, id }),
  });

/**
 * For retrieving the information of a specific tournament round occurring during the given episode.
 */
export const useTournamentRoundInfo = ({
  episodeId,
  tournament,
  id,
}: EpisodeTournamentRoundRetrieveRequest): UseQueryResult<TournamentRound> =>
  useQuery({
    queryKey: buildKey(tournamentRoundInfoFactory.queryKey, {
      episodeId,
      tournament,
      id,
    }),
    queryFn: async () =>
      await tournamentRoundInfoFactory.queryFn({ episodeId, tournament, id }),
  });

/**
 * For retrieving a list of the rounds in a specific tournament occurring during the given episode.
 */
export const useTournamentRoundList = (
  { episodeId, tournament }: EpisodeTournamentRoundListRequest,
  queryClient: QueryClient,
): UseQueryResult<PaginatedTournamentRoundList> =>
  useQuery({
    queryKey: buildKey(tournamentRoundListFactory.queryKey, {
      episodeId,
      tournament,
    }),
    queryFn: async () =>
      await tournamentRoundListFactory.queryFn(
        { episodeId, tournament },
        queryClient,
        true,
      ),
  });

// ---------- MUTATION HOOKS ---------- //
/**
 * For initializing the given tournament in the given episode.
 */
export const useInitializeTournament = (
  { episodeId, id }: EpisodeTournamentInitializeCreateRequest,
  queryClient: QueryClient,
): UseMutationResult<void, Error, EpisodeTournamentInitializeCreateRequest> =>
  useMutation({
    mutationKey: episodeMutationKeys.initializeTournament({ episodeId, id }),
    mutationFn: async ({
      episodeId,
      id,
    }: EpisodeTournamentInitializeCreateRequest) => {
      const toastFn = async (): Promise<void> => {
        await initializeTournament({ episodeId, id });

        // Refetch all info for this tournament
        try {
          // Invalidate all queries for this tournament TODO verify this works!
          const invalidateInfo = queryClient.invalidateQueries({
            queryKey: buildKey(episodeQueryKeys.tournamentBase, {
              episodeId,
              id,
            }),
          });
          const prefetchInfo = queryClient.prefetchQuery({
            queryKey: buildKey(tournamentInfoFactory.queryKey, {
              episodeId,
              id,
            }),
            queryFn: async () =>
              await tournamentInfoFactory.queryFn({ episodeId, id }),
          });
          const prefetchRounds = queryClient.prefetchQuery({
            queryKey: buildKey(tournamentRoundListFactory.queryKey, {
              episodeId,
              tournament: id,
              page: 1,
            }),
            queryFn: async () =>
              await tournamentRoundListFactory.queryFn(
                { episodeId, tournament: id, page: 1 },
                queryClient,
                true,
              ),
          });

          await Promise.all([invalidateInfo, prefetchInfo, prefetchRounds]);
        } catch (e) {
          toast.error((e as ResponseError).message);
        }
      };

      await toast.promise(toastFn(), {
        loading: "Initializing tournament...",
        success: "Tournament initialized!",
        error: "Error initializing tournament.",
      });
    },
  });

/**
 * For creating and enqueuing matches for the given tournament round.
 */
export const useCreateAndEnqueueMatches = (
  { episodeId, tournament, id }: EpisodeTournamentRoundEnqueueCreateRequest,
  queryClient: QueryClient,
): UseMutationResult<void, Error, EpisodeTournamentRoundEnqueueCreateRequest> =>
  useMutation({
    mutationKey: episodeMutationKeys.createEnqueueTournamentRound({
      episodeId,
      tournament,
      id,
      maps: [], // the maps are not part of the key
    }),
    mutationFn: async ({
      episodeId,
      tournament,
      id,
      maps,
    }: EpisodeTournamentRoundEnqueueCreateRequest) => {
      const toastFn = async (): Promise<void> => {
        await createAndEnqueueMatches({ episodeId, tournament, id, maps });

        // Refetch this tournament's rounds
        try {
          const invalidateRounds = queryClient.invalidateQueries({
            queryKey: buildKey(episodeQueryKeys.tournamentBase, {
              episodeId,
              id: tournament,
            }),
          });
          const prefetchRounds = queryClient.prefetchQuery({
            queryKey: buildKey(tournamentRoundListFactory.queryKey, {
              episodeId,
              tournament,
              page: 1,
            }),
            queryFn: async () =>
              await tournamentRoundListFactory.queryFn(
                { episodeId, tournament, page: 1 },
                queryClient,
                true,
              ),
          });

          await Promise.all([invalidateRounds, prefetchRounds]);
        } catch (e) {
          toast.error((e as ResponseError).message);
        }
      };

      await toast.promise(toastFn(), {
        loading: "Creating and enqueuing matches...",
        success: "Matches created and enqueued!",
        error: "Error creating and enqueuing matches.",
      });
    },
  });

/**
 * For releasing the given tournament round to the bracket service.
 */
export const useReleaseTournamentRound = ({
  episodeId,
  tournament,
  id,
}: EpisodeTournamentRoundReleaseCreateRequest): UseMutationResult<
  void,
  Error,
  EpisodeTournamentRoundReleaseCreateRequest
> =>
  useMutation({
    mutationKey: episodeMutationKeys.releaseTournamentRound({
      episodeId,
      tournament,
      id,
    }),
    mutationFn: async ({
      episodeId,
      tournament,
      id,
    }: EpisodeTournamentRoundReleaseCreateRequest) => {
      const toastFn = async (): Promise<void> => {
        await releaseTournamentRound({ episodeId, tournament, id });
      };

      await toast.promise(toastFn(), {
        loading: "Initiating round release...",
        success: "Round release initiated!",
        error: "Error releasing tournament round.",
      });
    },
  });
