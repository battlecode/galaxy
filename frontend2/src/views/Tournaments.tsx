import React, { useContext, useState, useEffect, useRef } from "react";
import { EpisodeContext } from "../contexts/EpisodeContext";
import ReactMarkdown from "react-markdown";
import { NavLink, Link } from "react-router-dom";
import { BC23_TOURNAMENTS, TourneyPage } from "../content/bc23";
import { type Tournament } from "../utils/types";
import { getAllTournaments } from "../utils/api/episode";
import BattlecodeTable from "../components/BattlecodeTable";
// import { CurrentUserContext } from "../contexts/CurrentUserContext";
import Icon from "../components/elements/Icon";
import Markdown from "../components/elements/Markdown";

const Tournaments: React.FC = () => {
  const episodeId = useContext(EpisodeContext).episodeId;
  // const currentUser = useContext(CurrentUserContext)?.user;

  const [schedule, setSchedule] = useState<Tournament[] | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const scheduleHasLoaded = useRef(false);

  useEffect(() => {
    const fetchSchedule = async (): Promise<void> => {
      if (!scheduleHasLoaded.current) {
        scheduleHasLoaded.current = true;
        setLoading(true);
        try {
          const result = await getAllTournaments(episodeId);
          setSchedule(result.results);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
    };

    void fetchSchedule();

    return () => {
      scheduleHasLoaded.current = false;
    };
  }, [episodeId]);

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto bg-white p-6">
      <Markdown text={BC23_TOURNAMENTS[TourneyPage.SCHEDULE]} />
      <BattlecodeTable
        data={schedule ?? []}
        loading={loading}
        columns={[
          {
            header: "Tournament",
            value: (r) => r.name_long,
          },
          {
            header: "Date",
            value: (r) =>
              new Date(r.display_date).toLocaleDateString([], {
                timeZone: "UTC",
              }),
          },
          {
            header: "Eligibility",
            value: (r) =>
              r.is_eligible ? (
                <Icon name={"check"} className="text-green-700" size="sm" />
              ) : (
                "No"
              ),
            // TODO: replace ^^ with x mark icon and maybe check current user team with api call?
          },
          {
            header: "Results",
            value: (r) => (
              <NavLink
                to={`/${episodeId}/tournament/${r.name_short}`}
                className="text-cyan-600 hover:underline"
              >
                View
              </NavLink>
            ),
          },
          {
            header: "About",
            value: (r) => <span>{r.blurb}</span>,
          },
        ]}
      />

      <Markdown
        className="mt-10"
        text={`${BC23_TOURNAMENTS[TourneyPage.PRIZES]} ${
          BC23_TOURNAMENTS[TourneyPage.FORMAT]
        } ${BC23_TOURNAMENTS[TourneyPage.RULES]}
        `}
      />
    </div>
  );
};

export default Tournaments;
