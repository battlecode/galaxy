import { useQuery } from "@tanstack/react-query";
import { getEpisodeInfo } from "../level-2/episode";

// ---------- KEY FACTORIES ----------//
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

// ---------- QUERY HOOKS ----------//
/**
 * For retrieving the given episode's info.
 */
export const useEpisodeInfo = (episodeId: string) =>
  useQuery({
    queryKey: episodeQueryKeys.info(episodeId),
    // TODO: check that this is correct!
    queryFn: async () => await getEpisodeInfo(episodeId),
  });
// TODO: more queries!
