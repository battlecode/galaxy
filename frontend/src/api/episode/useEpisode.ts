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
  EpisodeTournamentRoundRequeueCreateRequest,
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
  requeueTournamentRound,
} from "./episodeApi";
import toast from "react-hot-toast";
import { competeQueryKeys } from "api/compete/competeKeys";

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
  { episodeId, tournament, page = 1 }: EpisodeTournamentRoundListRequest,
  queryClient: QueryClient,
): UseQueryResult<PaginatedTournamentRoundList> =>
  useQuery({
    queryKey: buildKey(tournamentRoundListFactory.queryKey, {
      episodeId,
      tournament,
      page,
    }),
    queryFn: async () =>
      await tournamentRoundListFactory.queryFn(
        { episodeId, tournament, page },
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
          void queryClient.refetchQueries({
            queryKey: buildKey(episodeQueryKeys.tournamentBase, {
              episodeId,
              id,
            }),
          });

          void queryClient.refetchQueries({
            queryKey: buildKey(competeQueryKeys.matchBase, { episodeId }),
          });
        } catch (e) {
          toast.error((e as ResponseError).message);
        }
      };

      await toast.promise(toastFn(), {
        loading: "Initializing tournament...",
        success: "Tournament initialized!",
        error: (e) => `Error initializing tournament: ${(e as Error).message}`,
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
        try {
          await createAndEnqueueMatches({ episodeId, tournament, id, maps });

          // Refetch this tournament round and its matches
          const roundInfo = queryClient.refetchQueries({
            queryKey: buildKey(episodeQueryKeys.tournamentRoundInfo, {
              episodeId,
              tournament,
              id,
            }),
          });

          const tourneyMatches = queryClient.refetchQueries({
            queryKey: buildKey(competeQueryKeys.matchBase, { episodeId }),
          });

          await Promise.all([roundInfo, tourneyMatches]);
        } catch (e: unknown) {
          const error = e as ResponseError;
          // Parse the response text as JSON, detail propety contains the error message
          const errorJson = (await error.response.json()) as {
            detail?: string;
          };
          const errorDetail =
            errorJson.detail ?? "An unexpected error occurred.";
          throw new Error(errorDetail);
        }
      };

      await toast.promise(toastFn(), {
        loading: "Creating and enqueuing matches...",
        success: "Matches created and enqueued!",
        error: (error: Error) => error.message, // Return the error message thrown in toastFn
      });
    },
  });

/**
 * For releasing the given tournament round to the bracket service.
 */
export const useReleaseTournamentRound = (
  { episodeId, tournament, id }: EpisodeTournamentRoundReleaseCreateRequest,
  queryClient: QueryClient,
): UseMutationResult<void, Error, EpisodeTournamentRoundReleaseCreateRequest> =>
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
        try {
          await releaseTournamentRound({ episodeId, tournament, id });

          await queryClient.refetchQueries({
            queryKey: buildKey(episodeQueryKeys.tournamentRoundInfo, {
              episodeId,
              tournament,
              id,
            }),
          });
        } catch (e: unknown) {
          const error = e as ResponseError;
          // Parse the response text as JSON, detail propety contains the error message
          const errorJson = (await error.response.json()) as {
            detail?: string;
          };
          const errorDetail =
            errorJson.detail ?? "An unexpected error occurred.";
          throw new Error(errorDetail);
        }
      };

      await toast.promise(toastFn(), {
        loading: "Initiating round release...",
        success: "Round release initiated!",
        error: (error: Error) => error.message, // Return the error message thrown in toastFn
      });
    },
  });

export const useRequeueTournamentRound = (
  { episodeId, tournament, id }: EpisodeTournamentRoundRequeueCreateRequest,
  queryClient: QueryClient,
): UseMutationResult<void, Error, EpisodeTournamentRoundRequeueCreateRequest> =>
  useMutation({
    mutationKey: episodeMutationKeys.requeueTournamentRound({
      episodeId,
      tournament,
      id,
    }),
    mutationFn: async ({
      episodeId,
      tournament,
      id,
    }: EpisodeTournamentRoundRequeueCreateRequest) => {
      const toastFn = async (): Promise<void> => {
        try {
          await requeueTournamentRound({ episodeId, tournament, id });

          // Refetch this tournament round and its matches
          const roundInfo = queryClient.refetchQueries({
            queryKey: buildKey(episodeQueryKeys.tournamentRoundInfo, {
              episodeId,
              tournament,
              id,
            }),
          });

          const tourneyMatches = queryClient.refetchQueries({
            queryKey: buildKey(competeQueryKeys.matchBase, { episodeId }),
          });

          await Promise.all([roundInfo, tourneyMatches]);
        } catch (e: unknown) {
          const error = e as ResponseError;
          // Parse the response text as JSON, detail propety contains the error message
          const errorJson = (await error.response.json()) as {
            detail?: string;
          };
          const errorDetail =
            errorJson.detail ?? "An unexpected error occurred.";
          throw new Error(errorDetail);
        }
      };

      await toast.promise(toastFn(), {
        loading: "Initiating round requeue...",
        success: "Failed matches requeued!",
        error: (error: Error) => error.message, // Return the error message thrown in toastFn
      });
    },
  });
