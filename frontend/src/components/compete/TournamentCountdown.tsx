import type React from "react";
import { useCallback } from "react";
import type { Tournament } from "../../api/_autogen";
import { dateTime } from "../../utils/dateTime";
import { NavLink } from "react-router-dom";
import { useEpisodeId } from "contexts/EpisodeContext";
import CountdownDisplay from "components/CountdownDisplay";

interface TournamentCountdownProps {
  tournament?: Tournament;
}

const TournamentCountdown: React.FC<TournamentCountdownProps> = ({
  tournament,
}) => {
  const { episodeId } = useEpisodeId();

  const dateHasPassed = useCallback(
    (date: Date) => date.getTime() < Date.now(),
    [],
  );

  return (
    <div>
      {tournament !== undefined ? (
        <div className="flex flex-col gap-4">
          <span>
            The submission deadline for the <b>{tournament.name_long}</b>{" "}
            {dateHasPassed(tournament.submission_freeze) ? "was" : "is"} at{" "}
            {dateTime(tournament.submission_freeze).estDateStr} Eastern Time,
            which {dateHasPassed(tournament.submission_freeze) ? "was" : "is"}{" "}
            <b>
              {dateTime(tournament.submission_freeze).localFullString} in your
              local time.
            </b>
          </span>
          <span>
            Make sure you have{" "}
            <NavLink
              className="text-cyan-600 hover:underline"
              to={`/${episodeId}/tournaments`}
            >
              checked your tournament eligibility
            </NavLink>{" "}
            prior to the deadline! You can indicate your eligibility on your{" "}
            <NavLink
              className="text-cyan-600 hover:underline"
              to={`/${episodeId}/my_team`}
            >
              team profile page
            </NavLink>
            .
          </span>
          {tournament.require_resume && (
            <span>
              Also make sure to have all members upload a resume, at your{" "}
              <NavLink
                className="text-cyan-600 hover:underline"
                to={`/account`}
              >
                personal profile page
              </NavLink>
              . See the eligibility rules given in the{" "}
              <NavLink
                className="text-cyan-600 hover:underline"
                to={`/${episodeId}/tournament/${tournament.name_short}`}
              >
                tournament page
              </NavLink>{" "}
              for more info.
            </span>
          )}

          <div className="flex w-full items-center justify-center">
            <CountdownDisplay date={tournament.submission_freeze} />
          </div>
        </div>
      ) : (
        <span>
          The submission deadline for the next tournament has not been set yet.
        </span>
      )}
    </div>
  );
};

export default TournamentCountdown;
