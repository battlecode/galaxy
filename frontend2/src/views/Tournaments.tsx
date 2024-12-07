import type React from "react";
import { useMemo } from "react";
import { useEpisodeId } from "../contexts/EpisodeContext";
import { useSearchParams } from "react-router-dom";
import { tournamentsText } from "../content/ManageContent";
import { TourneyPage } from "../content/ContentStruct";
import OptionalSectionCardMarkdown from "../components/OptionalSectionCardMarkdown";
import { getParamEntries, parsePageParam } from "../utils/searchParamHelpers";
import TournamentsTable from "../components/tables/TournamentsTable";
import { useTournamentList } from "../api/episode/useEpisode";
import { useQueryClient } from "@tanstack/react-query";
import NoContentFound from "./NoContentFound";
import { isNil } from "lodash";
interface QueryParams {
  schedulePage: number;
}

const Tournaments: React.FC = () => {
  const { episodeId } = useEpisodeId();
  const queryClient = useQueryClient();

  const [searchParams, setSearchParams] = useSearchParams();
  const queryParams: QueryParams = useMemo(
    () => ({
      schedulePage: parsePageParam("schedulePage", searchParams),
    }),
    [searchParams],
  );

  const { data: schedule, isLoading: scheduleLoading } = useTournamentList(
    {
      episodeId,
      page: queryParams.schedulePage,
    },
    queryClient,
  );

  const currentTournamentText = tournamentsText[episodeId];
  const hasContent =
    !isNil(currentTournamentText) &&
    Object.values(currentTournamentText).some((value) => value !== "");

  if (!hasContent) {
    return <NoContentFound />;
  }
  return (
    <div className="flex h-full w-full flex-col overflow-y-auto p-6">
      <div className="flex flex-1 flex-col gap-8">
        <OptionalSectionCardMarkdown
          title={TourneyPage.SCHEDULE}
          textRecord={currentTournamentText}
        >
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
        </OptionalSectionCardMarkdown>

        <OptionalSectionCardMarkdown
          title={TourneyPage.PRIZES}
          textRecord={currentTournamentText}
        />

        <OptionalSectionCardMarkdown
          title={TourneyPage.FORMAT}
          textRecord={currentTournamentText}
        />

        <OptionalSectionCardMarkdown
          title={TourneyPage.RULES}
          textRecord={currentTournamentText}
        />
      </div>
    </div>
  );
};

export default Tournaments;
