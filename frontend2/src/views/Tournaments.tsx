import React, { useMemo } from "react";
import { useEpisodeId } from "../contexts/EpisodeContext";
import { useSearchParams } from "react-router-dom";
import {
  tournamentsText,
  defaultTournamentsText,
} from "../content/ManageContent";
import { TourneyPage } from "../content/ContentStruct";
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
  const currentTournamentText =
    tournamentsText[episodeId] ?? defaultTournamentsText;
  return (
    <div className="flex h-full w-full flex-col overflow-y-auto bg-white p-6">
      <div className="flex flex-1 flex-col gap-8">
        <SectionCard>
          <Markdown text={currentTournamentText[TourneyPage.SCHEDULE]} />
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
          <Markdown text={`${currentTournamentText[TourneyPage.PRIZES]}`} />
        </SectionCard>
        <SectionCard>
          <Markdown text={`${currentTournamentText[TourneyPage.FORMAT]}`} />
        </SectionCard>
        <SectionCard>
          <Markdown text={`${currentTournamentText[TourneyPage.RULES]}`} />
        </SectionCard>
      </div>
    </div>
  );
};

export default Tournaments;
