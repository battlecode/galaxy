import type {
  PaginatedTeamPublicList,
  TeamPrivate,
  TeamPublic,
  TeamTListRequest,
  TeamTMeRetrieveRequest,
  TeamTRetrieveRequest,
} from "../_autogen";
import type { PaginatedQueryFactory, QueryFactory } from "../apiTypes";
import { prefetchNextPage } from "../helpers";
import { getTeamInfo, getUserTeamInfo, searchTeams } from "./teamApi";
import { teamQueryKeys } from "./teamKeys";

export const myTeamFactory: QueryFactory<TeamTMeRetrieveRequest, TeamPrivate> =
  {
    queryKey: teamQueryKeys.myTeam,
    queryFn: async ({ episodeId }) => await getUserTeamInfo({ episodeId }),
  } as const;

export const otherTeamInfoFactory: QueryFactory<
  TeamTRetrieveRequest,
  TeamPublic
> = {
  queryKey: teamQueryKeys.otherInfo,
  queryFn: async ({ episodeId, id }) => await getTeamInfo({ episodeId, id }),
} as const;

export const searchTeamsFactory: PaginatedQueryFactory<
  TeamTListRequest,
  PaginatedTeamPublicList
> = {
  queryKey: teamQueryKeys.search,
  queryFn: async (request, queryClient, prefetchNext) => {
    const result = await searchTeams(request);
    // Prefetch the next page if we want to prefetch
    if (prefetchNext) {
      await prefetchNextPage(
        request,
        result,
        { queryKey: teamQueryKeys.search, queryFn: searchTeamsFactory.queryFn },
        queryClient,
      );
    }

    return result;
  },
} as const;
