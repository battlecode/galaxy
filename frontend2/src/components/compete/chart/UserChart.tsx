import type React from "react";
import { useMemo, useState } from "react";
import { useEpisodeList, useTournamentList } from "api/episode/useEpisode";
import SelectMenu from "../../elements/SelectMenu";
import ChartBase from "./ChartBase";
import { useUserRatingHistoryList } from "api/compete/useCompete";
import { useQueryClient } from "@tanstack/react-query";
import { useEpisodeId } from "contexts/EpisodeContext";
import {
  formatRatingHistory,
  formatTournamentList,
  type PlotLine,
  type ChartData,
} from "./chartUtils";

const UserChart: React.FC = () => {
  const { episodeId } = useEpisodeId();
  const queryClient = useQueryClient();

  const [selectedEpisode, setSelectedEpisode] = useState(episodeId);

  const episodeList = useEpisodeList({}, queryClient);
  const tournamentList = useTournamentList(
    { episodeId: selectedEpisode },
    queryClient,
  );
  const ratingHistory = useUserRatingHistoryList({
    episodeId: selectedEpisode,
  });

  const ratingData: Record<string, ChartData[]> | undefined = useMemo(() => {
    if (!ratingHistory.isSuccess) return undefined;
    return formatRatingHistory(ratingHistory.data);
  }, [ratingHistory]);

  const tournamentData: PlotLine[] | undefined = useMemo(() => {
    if (!tournamentList.isSuccess) return undefined;
    return formatTournamentList(tournamentList.data.results ?? []);
  }, [tournamentList]);

  return (
    <div className="flex flex-1 flex-col gap-8">
      <SelectMenu
        options={
          episodeList.data?.results?.map((ep) => ({
            value: ep.name_short,
            label: ep.name_long,
          })) ?? []
        }
        label={"Select Episode"}
        value={selectedEpisode}
        onChange={setSelectedEpisode}
        loading={tournamentList.isLoading}
      />

      <ChartBase
        yAxisLabel="Rating"
        values={ratingData}
        loading={ratingHistory.isLoading}
        loadingMessage="Loading rating data..."
        plotLines={tournamentData}
      />
    </div>
  );
};

export default UserChart;
