import React from "react";
import {
  type Match,
  StatusBccEnum,
  type MatchParticipant,
} from "../../utils/types/models";

interface MatchScoreProps {
  match: Match;
  userTeamId?: number;
}

const MatchScore: React.FC<MatchScoreProps> = ({
  match,
  userTeamId,
}: MatchScoreProps) => {
  const myTeam =
    match.participants.find((p) => p.team === userTeamId) ??
    match.participants[0];
  const opponent =
    match.participants?.find((p) => p.team !== myTeam?.team) ??
    match.participants[1];

  const scoreDisplay = (): React.ReactNode => (
    <>
      {match.status === StatusBccEnum.Ok &&
      myTeam !== undefined &&
      opponent !== undefined &&
      myTeam?.score !== null &&
      opponent?.score !== null
        ? `${myTeam?.score} - ${opponent?.score}`
        : match.status === StatusBccEnum.Ok
        ? "Hidden"
        : "? - ?"}
    </>
  );

  const getResult = (
    team1: MatchParticipant,
    team2: MatchParticipant,
  ): React.ReactNode => {
    const resultClass =
      team1.score === null || team2.score === null
        ? "text-sm text-gray-700 bg-gray-200 rounded-full px-2.5 py-1"
        : team1.score > team2.score
        ? "text-sm text-gray-700 bg-green-200 rounded-full px-2 py-1"
        : team1.score < team2.score
        ? "text-sm text-gray-700 bg-red-200 rounded-full px-2.5 py-1"
        : "text-sm text-gray-700 bg-red-200 rounded-full px-2.5 py-1";

    const result =
      team1.score === null || team2.score === null
        ? "-"
        : team1.score > team2.score
        ? "W"
        : team1.score < team2.score
        ? "L"
        : "T";

    return <div className={resultClass}>{result}</div>;
  };

  if (userTeamId === undefined)
    return (
      <div className={"flex w-28 flex-row items-center justify-between"}>
        {getResult(myTeam, opponent)}
        {scoreDisplay()}
        {getResult(opponent, myTeam)}
      </div>
    );

  return (
    <div className={"flex w-18 flex-row items-center justify-between"}>
      {scoreDisplay()}
      {getResult(myTeam, opponent)}
    </div>
  );
};

export default MatchScore;
