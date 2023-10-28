import React, { useState, useEffect, useRef, useMemo } from "react";
import { useEpisodeId } from "../contexts/EpisodeContext";
import { NavLink, useSearchParams } from "react-router-dom";
import { BC23_TOURNAMENTS, TourneyPage } from "../content/bc23";
import type { PaginatedTournamentList, Tournament } from "../utils/types";
import { getAllTournaments } from "../utils/api/episode";
import BattlecodeTable from "../components/BattlecodeTable";
import Icon from "../components/elements/Icon";
import Markdown from "../components/elements/Markdown";
import { dateTime } from "../utils/dateTime";
import BattlecodeTableBottomElement from "../components/BattlecodeTableBottomElement";

interface QueryParams {
  page: number;
}

const getParamEntries = (prev: URLSearchParams): Record<string, string> => {
  return Object.fromEntries(prev);
};

const Tournaments: React.FC = () => {
  const { episodeId } = useEpisodeId();

  const [searchParams, setSearchParams] = useSearchParams();

  const parsePageParam = (paramName: string): number =>
    parseInt(searchParams.get(paramName) ?? "1");

  const queryParams: QueryParams = useMemo(() => {
    return {
      page: parsePageParam("page"),
    };
  }, [searchParams]);

  const [schedule, setSchedule] = useState<PaginatedTournamentList>();
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let isActiveLookup = true;
    if (loading) return;
    setLoading(true);
    setSchedule((prev) => ({ count: prev?.count ?? 0 }));

    const fetchSchedule = async (): Promise<void> => {
      try {
        const result = await getAllTournaments(episodeId, queryParams.page); // TODO: page!
        if (isActiveLookup) {
          setSchedule(result);
        }
      } catch (err) {
        if (isActiveLookup) {
          setSchedule(undefined);
        }
        console.error(err);
      } finally {
        if (isActiveLookup) {
          setLoading(false);
        }
      }
    };

    void fetchSchedule();

    return () => {
      isActiveLookup = false;
    };
  }, [episodeId, queryParams.page]);

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto bg-white p-6">
      <Markdown text={BC23_TOURNAMENTS[TourneyPage.SCHEDULE]} />
      <BattlecodeTable
        data={schedule?.results ?? []}
        loading={loading}
        columns={[
          {
            header: "Tournament",
            value: (r) => r.name_long,
          },
          {
            header: "Date",
            value: (r) => dateTime(r.display_date).localFullString,
          },
          {
            header: "Eligibility",
            value: (r) =>
              r.is_eligible ? (
                <Icon name={"check"} className="text-green-700" size="md" />
              ) : (
                <Icon name={"x_mark"} className="text-red-700" size="md" />
              ),
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
        bottomElement={
          <BattlecodeTableBottomElement
            totalCount={schedule?.count ?? 0}
            pageSize={10}
            currentPage={queryParams.page}
            onPage={(page) => {
              if (!loading) {
                setSearchParams((prev) => ({
                  ...getParamEntries(prev),
                  page: page.toString(),
                }));
              }
            }}
          />
        }
      />

      <Markdown
        className="mt-10"
        text={`${BC23_TOURNAMENTS[TourneyPage.PRIZES]} ${
          BC23_TOURNAMENTS[TourneyPage.FORMAT]
        } ${BC23_TOURNAMENTS[TourneyPage.RULES]}
        `}
      />
      <hr className="my-8 h-1 border-0 bg-gray-200" />
    </div>
  );
};

export default Tournaments;
