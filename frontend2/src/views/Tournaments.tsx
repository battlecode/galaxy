import React, { useMemo } from "react";
import { useEpisodeId } from "../contexts/EpisodeContext";
import { useSearchParams } from "react-router-dom";
import { BC23_TOURNAMENTS, TourneyPage } from "../content/bc23";
import Markdown from "../components/elements/Markdown";
import SectionCard from "../components/SectionCard";
import { getParamEntries, parsePageParam } from "../utils/searchParamHelpers";
import TournamentsTable from "../components/tables/TournamentsTable";
import { useTournamentList } from "../api/episode/useEpisode";
import { useQueryClient } from "@tanstack/react-query";

interface QueryParams {
  schedulePage: number;
}

const Tournaments: React.FC = () => {
  const { episodeId } = useEpisodeId();
  const queryClient = useQueryClient();

  const [searchParams, setSearchParams] = useSearchParams();
  const queryParams: QueryParams = useMemo(() => {
    return {
      schedulePage: parsePageParam("schedulePage", searchParams),
    };
  }, [searchParams]);

  const { data: schedule, isLoading: scheduleLoading } = useTournamentList(
    {
      episodeId,
      page: queryParams.schedulePage,
    },
    queryClient,
  );

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto bg-white p-6">
      <div className="flex flex-1 flex-col gap-8">
        <SectionCard>
          <Markdown text={BC23_TOURNAMENTS[TourneyPage.SCHEDULE]} />
          <TournamentsTable
            data={schedule}
            loading={scheduleLoading}
            page={queryParams.schedulePage}
            handlePage={(page: number) => {
              setSearchParams((prev) => ({
                ...getParamEntries(prev),
                schedulePage: page.toString(),
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
