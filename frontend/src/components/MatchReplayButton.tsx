import type React from "react";
import { StatusBccEnum, type Episode, type Match } from "api/_autogen";
import { isPresent, type Maybe } from "utils/utilTypes";
import Button from "./elements/Button";
import Tooltip from "./elements/Tooltip";
import type { UseQueryResult } from "@tanstack/react-query";

interface MatchReplayButtonProps {
  episode: UseQueryResult<Episode>;
  match: Maybe<Match>;
}

const MatchReplayButton: React.FC<MatchReplayButtonProps> = ({
  episode,
  match,
}) => {
  const disabled =
    !episode.isSuccess ||
    !isPresent(match) ||
    !isPresent(match.replay_url) ||
    match.status !== StatusBccEnum.Ok;

  const button = (
    <Button
      disabled={disabled}
      label="Replay!"
      onClick={() => {
        window.open(
          `https://releases.battlecode.org/client/${
            episode.data?.artifact_name ?? ""
          }/${
            episode.data?.release_version_public ?? ""
          }/index.html?gameSource=${match?.replay_url}`,
          "_blank",
        );
      }}
    />
  );

  if (disabled) {
    return (
      <Tooltip text="Replay is not available for this match">{button}</Tooltip>
    );
  } else {
    return button;
  }
};

export default MatchReplayButton;
