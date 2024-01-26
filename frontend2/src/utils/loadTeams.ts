import { searchTeams } from "../api/team/teamApi";
import type { PaginatedTeamPublicList } from "../api/_autogen";

/**
 * Search for teams by name. Often used for the AsyncSelectMenu component.
 * @param episodeId
 * @param search Team name search string.
 * @param page (Optional) Page number (default: 1).
 * @returns An array of value/label pairs, which is expected by the AsyncSelectMenu component.
 */
export const loadTeamOptions = async (
  episodeId: string,
  search: string,
  page?: number,
): Promise<Array<{ value: number; label: string }>> => {
  try {
    const result: PaginatedTeamPublicList = await searchTeams({
      episodeId,
      search,
      page,
    });
    return (
      result.results?.map((t) => ({
        value: t.id,
        label: t.name,
      })) ?? []
    );
  } catch (err) {
    console.error(err);
    return [];
  }
};
