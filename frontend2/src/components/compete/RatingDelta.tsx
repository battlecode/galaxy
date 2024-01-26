import { NavLink } from "react-router-dom";
import { type MatchParticipant } from "../../api/_autogen";
import React from "react";
import { useEpisodeId } from "../../contexts/EpisodeContext";

interface RatingDeltaProps {
  participant: MatchParticipant;
  ranked: boolean;
}

const RatingDelta: React.FC<RatingDeltaProps> = ({ participant, ranked }) => {
  const { episodeId } = useEpisodeId();

  const newRating = ranked
    ? Math.round(participant.rating)
    : Math.round(participant.old_rating);
  const oldRating =
    participant.old_rating !== null ? Math.round(participant.old_rating) : 0;
  const ratingDelta = Math.abs(newRating - oldRating);
  const deltaClass =
    newRating > oldRating
      ? "text-xs font-semibold slashed-zero text-green-700"
      : newRating < oldRating
      ? "text-xs font-semibold slashed-zero text-red-700"
      : "text-xs font-semibold slashed-zero text-gray-700";
  return (
    <>
      <NavLink
        to={`/${episodeId}/team/${participant.team}`}
        className="hover:underline"
      >
        {participant.teamname}
      </NavLink>
      <span>{` (${newRating} `}</span>
      <span className={deltaClass}>
        {`${
          newRating > oldRating ? " +" : newRating < oldRating ? " -" : " ±"
        }${ratingDelta}`}
      </span>
      <span>{`)`}</span>
    </>
  );
};

export default RatingDelta;
