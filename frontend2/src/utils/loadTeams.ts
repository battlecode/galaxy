import { searchTeams } from "./api/team";
import type { PaginatedTeamPublicList } from "./types";

/**
 * Search for teams by name.
 * @param episodeId
 * @param inputValue Team name search string.
 * @param requireActiveSubmission (Optional) Whether to only return teams with active submissions (default: true).
 * @param page (Optional) Page number (default: 1).
 * @returns Array of teams.
 */
export const loadTeamOptions = async (
  episodeId: string,
  inputValue: string,
  requireActiveSubmission?: boolean,
  page?: number,
): Promise<Array<{ value: number; label: string }>> => {
  try {
    const result: PaginatedTeamPublicList = await searchTeams(
      episodeId,
      inputValue,
      requireActiveSubmission ?? true,
      page ?? 1,
    );
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
