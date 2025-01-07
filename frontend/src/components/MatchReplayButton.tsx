import type React from "react";
import { StatusBccEnum, type Episode, type Match } from "api/_autogen";
import { isPresent, type Maybe } from "utils/utilTypes";
import Button from "./elements/Button";
import Tooltip from "./elements/Tooltip";
import type { UseQueryResult } from "@tanstack/react-query";
import { getClientUrl } from "api/helpers";

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

  const clientUrl = getClientUrl(
    episode.data?.name_short,
    episode.data?.artifact_name,
    episode.data?.release_version_client,
    match?.replay_url ?? "",
  );

  const button = (
    <Button
      disabled={disabled || !isPresent(clientUrl)}
      label="Replay!"
      onClick={() => {
        if (isPresent(clientUrl)) {
          window.open(clientUrl);
        }
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
