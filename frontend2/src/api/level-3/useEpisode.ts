import { useQuery } from "@tanstack/react-query";
import { EpisodeApi, type EpisodeERetrieveRequest } from "../level-1";
import { DEFAULT_API_CONFIGURATION } from "../level-2/helpers";

// ---------- EPISODE API ---------- //
const episodeApi = new EpisodeApi(DEFAULT_API_CONFIGURATION);
export const episodeQueries = {
  getEpisodeInfo: async ({ id }: EpisodeERetrieveRequest) =>
    await episodeApi.episodeERetrieve({ id }),
  // ... more queries
};

// ---------- KEY FACTORIES ---------- //
export const episodeQueryKeys = {
  base: ["episode"] as const,
  info: (episodeId: string) => ["episode", "info", episodeId] as const,
  all: () => [...episodeQueryKeys.base, "all"] as const,
  maps: (episodeId: string) =>
    [...episodeQueryKeys.base, "map", "all", episodeId] as const,
  nextTournament: (episodeId: string) =>
    [...episodeQueryKeys.base, "tournament", "next", episodeId] as const,
  allTournaments: (episodeId: string) =>
    [...episodeQueryKeys.base, "tournament", "all", episodeId] as const,
  tournamentInfo: (episodeId: string, tournamentId: string) =>
    [
      ...episodeQueryKeys.base,
      "tournament",
      "info",
      episodeId,
      tournamentId,
    ] as const,
};

// ---------- QUERY HOOKS ---------- //
/**
 * For retrieving the given episode's info.
 */
export const useEpisodeInfo = ({ id }: EpisodeERetrieveRequest) =>
  useQuery({
    queryKey: episodeQueryKeys.info(id),
    // TODO: check that this is correct!
    queryFn: async () => await episodeApi.episodeERetrieve({ id }),
    // alternatively, we could do:
    // queryFn: () => episodeQueries.getEpisodeInfo({ id }),
  });
// TODO: more queries!
