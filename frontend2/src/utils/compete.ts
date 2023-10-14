import { type Match, StatusBccEnum } from "./types/models";

/**
 *
 * @param match
 * @returns A string representing the score of the match
 */
export const getMatchScore = (match: Match): string => {
  if (match.status !== StatusBccEnum.Ok) {
    return "? - ?";
  } else if (match.participants === null) {
    return "Hidden";
  }
  const team1 = match.participants[0];
  const team2 = match.participants[1];
  if (
    team1 === undefined ||
    team2 === undefined ||
    team1.score === null ||
    team2.score === null
  ) {
    return "Unknown";
  }
  return `${team1.score} - ${team2.score}`;
};
