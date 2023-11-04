import React, { useState, useEffect, useMemo } from "react";
import { useEpisodeId } from "../contexts/EpisodeContext";
import { useSearchParams } from "react-router-dom";
import { BC23_TOURNAMENTS, TourneyPage } from "../content/bc23";
import type { PaginatedTournamentList } from "../utils/types";
import { getAllTournaments } from "../utils/api/episode";
import Markdown from "../components/elements/Markdown";
import SectionCard from "../components/SectionCard";
import { getParamEntries, parsePageParam } from "../utils/searchParamHelpers";
import TournamentsTable from "../components/tables/TournamentsTable";

interface QueryParams {
  page: number;
}

const Tournaments: React.FC = () => {
  const { episodeId } = useEpisodeId();

  const [searchParams, setSearchParams] = useSearchParams();

  const queryParams: QueryParams = useMemo(() => {
    return {
      page: parsePageParam("page", searchParams),
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
        const result = await getAllTournaments(episodeId, queryParams.page);
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
      <div className="flex flex-1 flex-col gap-8">
        <SectionCard>
          <Markdown text={BC23_TOURNAMENTS[TourneyPage.SCHEDULE]} />
          <TournamentsTable
            data={schedule}
            loading={loading}
            page={queryParams.page}
            handlePage={(page: number) => {
              setSearchParams((prev) => ({
                ...getParamEntries(prev),
                page: page.toString(),
              }));
            }}
          />
        </SectionCard>
        <SectionCard>
          <Markdown text={`${BC23_TOURNAMENTS[TourneyPage.PRIZES]}`} />
        </SectionCard>
        <SectionCard>
          <Markdown text={`${BC23_TOURNAMENTS[TourneyPage.FORMAT]}`} />
        </SectionCard>
        <SectionCard>
          <Markdown text={`${BC23_TOURNAMENTS[TourneyPage.RULES]}`} />
        </SectionCard>
      </div>
    </div>
  );
};

export default Tournaments;
