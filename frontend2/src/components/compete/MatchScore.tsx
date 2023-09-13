import React from "react";
import { type Match, StatusBccEnum } from "../../utils/types/models";

interface MatchScoreProps {
  match: Match;
}

const MatchScore: React.FC<MatchScoreProps> = ({ match }: MatchScoreProps) => {
  const team1 = match.participants[0];
  const team2 = match.participants[1];

  return (
    <>
      {match.status === StatusBccEnum.Ok &&
      team1 !== null &&
      team2 !== null &&
      team1.score !== null &&
      team2.score !== null
        ? `${team1.score} - ${team2.score}`
        : match.status === StatusBccEnum.Ok
        ? "Hidden"
        : "? - ?"}
    </>
  );
};

export default MatchScore;
