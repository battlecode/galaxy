import React, { useCallback } from "react";
import type { Tournament } from "../../utils/types";
import { dateTime } from "../../utils/dateTime";
import { NavLink } from "react-router-dom";

interface TournamentCountdownProps {
  tournament?: Tournament;
}

const TournamentCountdown: React.FC<TournamentCountdownProps> = ({
  tournament,
}) => {
  const dateHasPassed = useCallback((date: Date) => {
    return date.getTime() > new Date().getTime();
  }, []);

  return (
    <div>
      {tournament !== undefined ? (
        <div>
          <p>
            The submission deadline for the <b>{tournament.name_long}</b>{" "}
            {dateHasPassed(tournament.submission_freeze) ? "was" : "is"} at{" "}
            {dateTime(tournament.submission_freeze).estDateStr} Eastern Time,
            which {dateHasPassed(tournament.submission_freeze) ? "was" : "is"}{" "}
            <b>
              {dateTime(tournament.submission_freeze).localFullString} in your
              local time.
            </b>
          </p>
          <p>
            Make sure you have{" "}
            <NavLink className="hover:underline" to="tournaments">
              checked your tournament eligibility
            </NavLink>{" "}
            prior to the deadline! You can indicate your eligibility on your{" "}
            <NavLink className="hover:underline" to="team">
              team profile page
            </NavLink>
            .
          </p>
          {tournament.require_resume && (
            <p>
              Also make sure to have all members upload a resume, at your{" "}
              <NavLink className="hover:underline" to="/account">
                personal profile page
              </NavLink>
              . See the eligibility rules given in the{" "}
              <NavLink className="hover:underline" to="team">
                tournament page
              </NavLink>{" "}
              for more info.
            </p>
          )}
        </div>
      ) : (
        <div>
          <p>
            The submission deadline for the next tournament has not been set
            yet.
          </p>
        </div>
      )}
    </div>
  );
};

export default TournamentCountdown;
