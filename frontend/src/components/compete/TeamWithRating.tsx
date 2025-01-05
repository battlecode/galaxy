import type React from "react";
import { useMemo } from "react";
import { useEpisodeId } from "../../contexts/EpisodeContext";
import { NavLink } from "react-router-dom";

interface TeamWithRatingProps {
  teamName: string;
  teamId: number;
  includeTeamName: boolean;
  rating: number;
  ratingDelta?: number;
}

const TeamWithRating: React.FC<TeamWithRatingProps> = ({
  teamName,
  teamId,
  includeTeamName,
  rating,
  ratingDelta,
}) => {
  const { episodeId } = useEpisodeId();

  const ratingComponent = useMemo(() => {
    if (ratingDelta !== undefined) {
      const deltaClass =
        ratingDelta > 0
          ? "text-xs font-semibold slashed-zero text-green-700"
          : ratingDelta < 0
          ? "text-xs font-semibold slashed-zero text-red-700"
          : "text-xs font-semibold slashed-zero text-gray-700";

      return (
        <span className={deltaClass}>
          {" "}
          {includeTeamName && <span>{"("}</span>}
          {`${
            ratingDelta > 0 ? " +" : ratingDelta < 0 ? " " : " ±"
          }${ratingDelta.toFixed(0)}`}
          {includeTeamName && <span>{")"}</span>}
        </span>
      );
    } else {
      return (
        <span>
          {" "}
          {includeTeamName && <span>{`(${rating.toFixed(0)})`}</span>}
          {!includeTeamName && <span>{rating.toFixed(0)}</span>}
        </span>
      );
    }
  }, [rating, ratingDelta, includeTeamName]);

  return (
    <>
      <NavLink to={`/${episodeId}/team/${teamId}`} className="hover:underline">
        {includeTeamName && <span>{teamName}</span>}
        {ratingComponent}
      </NavLink>
    </>
  );
};

export default TeamWithRating;
