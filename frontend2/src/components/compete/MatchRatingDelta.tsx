import { type MatchParticipant } from "api/_autogen";
import React from "react";
import TeamWithRating from "./TeamWithRating";

interface RatingDeltaProps {
  includeTeamName?: boolean;
  participant: MatchParticipant;
  ranked: boolean;
}

const MatchRatingDelta: React.FC<RatingDeltaProps> = ({
  includeTeamName,
  participant,
  ranked,
}) => {
  let newRating = 0;
  if (ranked) {
    newRating =
      participant.rating !== null
        ? Math.round(participant.rating)
        : Math.round(participant.old_rating);
  } else {
    newRating = Math.round(participant.old_rating);
  }
  const oldRating =
    participant.old_rating !== null ? Math.round(participant.old_rating) : 0;
  const ratingDelta = Math.abs(newRating - oldRating);

  const includeName = includeTeamName === undefined || includeTeamName;
  return (
    <TeamWithRating
      teamName={participant.teamname}
      teamId={participant.team}
      includeTeamName={includeName}
      rating={newRating}
      ratingDelta={ratingDelta}
    />
  );
};

export default MatchRatingDelta;
