import { useQueryClient } from "@tanstack/react-query";
import { useTournamentList } from "api/episode/useEpisode";
import { useEpisodeId } from "contexts/EpisodeContext";
import type React from "react";
import { useMemo } from "react";
import {
  type ChartData,
  type PlotLine,
  formatRatingHistory,
  formatTournamentList,
} from "./chartUtils";
import ChartBase from "./ChartBase";
import type { HistoricalRating } from "api/_autogen";

interface TeamChartProps {
  teamRatings: HistoricalRating[];
  loading?: boolean;
  crownTop?: boolean;
}

const TeamChart: React.FC<TeamChartProps> = ({
  teamRatings,
  loading = false,
  crownTop = false,
}) => {
  const { episodeId } = useEpisodeId();
  const queryClient = useQueryClient();

  const tournamentList = useTournamentList({ episodeId }, queryClient);

  const ratingData: Record<string, ChartData[]> | undefined = useMemo(
    () => formatRatingHistory(teamRatings),
    [teamRatings],
  );

  const tournamentData: PlotLine[] | undefined = useMemo(() => {
    if (!tournamentList.isSuccess) return undefined;
    return formatTournamentList(tournamentList.data.results ?? []);
  }, [tournamentList]);

  return (
    <ChartBase
      yAxisLabel="Rating"
      values={ratingData}
      loading={loading}
      loadingMessage="Loading rating data..."
      plotLines={tournamentData}
      crownTop={crownTop}
    />
  );
};

export default TeamChart;
