import type { MatchParticipant } from "api/_autogen";
import type React from "react";
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
      /* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition --
       * We need this check for ranked matches against staff teams
       */
      participant.rating !== null
        ? Math.round(participant.rating)
        : Math.round(participant.old_rating);
  } else {
    newRating = Math.round(participant.old_rating);
  }
  const oldRating =
    /* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition --
     * We need this check for ranked matches against staff teams
     */
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
