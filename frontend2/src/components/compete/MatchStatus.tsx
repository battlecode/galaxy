import React from "react";
import { type Match, StatusBccEnum } from "../../utils/types/models";

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
  const displayStatus = MatchStatusDisplays[match.status];

  // TODO: change this to a reusable Tooltip component when one is built!
  if (match.status === StatusBccEnum.Err) {
    return (
      <div>
        <span
          data-tooltip-target="failure-tooltip"
          className="p-1 hover:cursor-default hover:rounded-md hover:bg-gray-200"
        >
          {displayStatus}
        </span>
        <div
          id="failure-tooltip"
          role="tooltip"
          className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-sm transition-opacity duration-300"
        >
          <span>
            {`Our server has run into an error running this match. Don't worry,
            we're working on resolving it!`}
          </span>
          <div className="tooltip-arrow" data-popper-arrow></div>
        </div>
      </div>
    );
  } else {
    return <>{displayStatus}</>;
  }
};

export default MatchStatus;
