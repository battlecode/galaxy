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

const isInternalLink = (to: string): boolean => {
  const url = new URL(to, window.location.origin);
  return url.hostname === window.location.hostname;
};

const MarkdownSection: React.FC<{ children: string; className?: string }> = ({
  children,
  className,
}) => {
  return (
    <ReactMarkdown
      className={className}
      components={{
        a: ({ href, ...props }) => {
          const target = href ?? "";
          if (isInternalLink(target)) {
            return (
              <Link
                className="text-cyan-600 hover:underline"
                to={target}
                {...props}
              />
            );
          } else {
            return (
              <a
                className="text-cyan-600 hover:underline"
                href={target}
                {...props}
              />
            );
          }
        },
      }}
    >
      {children}
    </ReactMarkdown>
  );
};

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
      <MarkdownSection>
        {BC23_TOURNAMENTS[TourneyPage.SCHEDULE]}
      </MarkdownSection>
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
      <MarkdownSection className="mt-10">
        {BC23_TOURNAMENTS[TourneyPage.PRIZES]}
      </MarkdownSection>
      <MarkdownSection>{BC23_TOURNAMENTS[TourneyPage.FORMAT]}</MarkdownSection>
      <MarkdownSection className="mt-4">
        {BC23_TOURNAMENTS[TourneyPage.RULES]}
      </MarkdownSection>
    </div>
  );
};

export default Tournaments;
