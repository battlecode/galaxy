import type React from "react";
import { type Match, StatusBccEnum } from "../../api/_autogen/models";
import Tooltip from "../elements/Tooltip";

interface StatusProps {
  match: Match;
}

const MatchStatusDisplays: Record<StatusBccEnum, string> = {
  [StatusBccEnum.New]: "Created",
  [StatusBccEnum.Que]: "Queued",
  [StatusBccEnum.Run]: "Running",
  [StatusBccEnum.Try]: "Will be retried",
  [StatusBccEnum.Ok]: "Success",
  [StatusBccEnum.Err]: "Failed",
  [StatusBccEnum.Can]: "Cancelled",
};

const MatchStatus: React.FC<StatusProps> = ({ match }: StatusProps) => {
  const { [match.status]: displayStatus } = MatchStatusDisplays;

  return (
    <>
      {match.status === StatusBccEnum.Err ? (
        <Tooltip
          text={
            "Our server has run into an error running this match.\n Don't worry, we're working on resolving it!"
          }
        >
          {displayStatus}
        </Tooltip>
      ) : (
        <>{displayStatus}</>
      )}
    </>
  );
};

export default MatchStatus;
