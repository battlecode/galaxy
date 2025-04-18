import type React from "react";
import { useMemo } from "react";
import {
  type Match,
  StatusBccEnum,
  type MatchParticipant,
} from "../../api/_autogen/models";
import { isNil } from "lodash";
import type { Maybe } from "../../utils/utilTypes";

interface MatchScoreProps {
  match: Match;
  userTeamId?: number;
}

/**
 * @param match The match to display the score for.
 * @param userTeamId (Optional) The team ID of the user. If provided, the MatchScoreBadge will be from the user's perspective.
 * Otherwise, it will be done in order of Match.participants, and two badges will be present.
 */
const MatchScore: React.FC<MatchScoreProps> = ({
  match,
  userTeamId,
}: MatchScoreProps) => {
  const {
    firstTeam,
    secondTeam,
  }: {
    firstTeam: Maybe<MatchParticipant>;
    secondTeam: Maybe<MatchParticipant>;
  } = useMemo(() => {
    if (isNil(match.participants)) {
      return { firstTeam: undefined, secondTeam: undefined };
    }
    // If the team corresponding to userTeamId is in this match, display it first
    const firstTeam: MatchParticipant =
      match.participants.find((p) => p.team === userTeamId) ??
      match.participants[0];
    // If the team corresponding to userTeamId is in this match, display the other team second
    const secondTeam: MatchParticipant =
      match.participants.find((p) => p.team !== firstTeam.team) ??
      match.participants[1];

    return { firstTeam, secondTeam };
  }, [match]);

  const scoreDisplay: string = useMemo(() => {
    if (match.status !== StatusBccEnum.Ok) {
      // If this match is not completed, display "? - ?"
      return "? - ?";
    } else if (
      !isNil(firstTeam) &&
      !isNil(secondTeam) &&
      !isNil(firstTeam.score) &&
      !isNil(secondTeam.score)
    ) {
      // If this match is completed and we have scores for both teams, display the scores
      return `${firstTeam.score} - ${secondTeam.score}`;
    } else {
      // If this match is completed but we don't have scores for both teams, display "Hidden"
      // Typically tournament matches which are hidden!
      return "Hidden";
    }
  }, [firstTeam, secondTeam]);

  if (userTeamId === undefined)
    return (
      <div className={"flex w-28 flex-row items-center justify-between"}>
        <MatchScoreBadge
          firstTeamScore={firstTeam?.score ?? undefined}
          secondTeamScore={secondTeam?.score ?? undefined}
        />
        {scoreDisplay}
        <MatchScoreBadge
          firstTeamScore={secondTeam?.score ?? undefined}
          secondTeamScore={firstTeam?.score ?? undefined}
        />
      </div>
    );

  return (
    <div className={"flex w-[4.5rem] flex-row items-center justify-between"}>
      {scoreDisplay}
      <MatchScoreBadge
        firstTeamScore={firstTeam?.score ?? undefined}
        secondTeamScore={secondTeam?.score ?? undefined}
      />
    </div>
  );
};

interface BadgeProps {
  firstTeamScore: Maybe<number>;
  secondTeamScore: Maybe<number>;
}

/**
 * Displays the result of the match, from firstTeam's perspective. For example, if firstTeam won, this will display "W".
 * @param firstTeam The first team in the match. The result will display from this team's perspective.
 * @param secondTeam The second team in the match.
 */
const MatchScoreBadge: React.FC<BadgeProps> = ({
  firstTeamScore,
  secondTeamScore,
}) => {
  const resultClass: string = useMemo(() => {
    // Our base className
    let className = "text-sm text-gray-700 rounded-full py-1 ";
    if (
      isNil(firstTeamScore) ||
      isNil(secondTeamScore) ||
      firstTeamScore === secondTeamScore
    ) {
      // For ties and pending matches, we use the same className
      className += "bg-gray-200 px-2.5";
    } else if (firstTeamScore > secondTeamScore) {
      // Team 1 won!
      className += "bg-green-200 px-2";
    } else if (firstTeamScore < secondTeamScore) {
      // Team 1 lost :(
      className += "bg-red-200 px-2.5";
    }
    return className;
  }, [firstTeamScore, secondTeamScore]);

  const result: string = useMemo(() => {
    if (isNil(firstTeamScore) || isNil(secondTeamScore)) {
      // If we don't have scores for both teams, display "-"
      return "-";
    } else if (firstTeamScore > secondTeamScore) {
      // Team 1 won!
      return "W";
    } else if (firstTeamScore < secondTeamScore) {
      // Team 1 lost :(
      return "L";
    } else {
      // Team 1 tied with Team 2
      return "T";
    }
  }, [firstTeamScore, secondTeamScore]);

  return <div className={resultClass}>{result}</div>;
};

export default MatchScore;
