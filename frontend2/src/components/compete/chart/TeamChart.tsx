import { useQueryClient } from "@tanstack/react-query";
import { useTeamsRatingHistoryList } from "api/compete/useCompete";
import { useTournamentList } from "api/episode/useEpisode";
import { useEpisodeId } from "contexts/EpisodeContext";
import React, { useMemo } from "react";
import {
  type ChartData,
  type PlotLine,
  formatRatingHistory,
  formatTournamentList,
} from "./chartUtils";
import ChartBase from "./ChartBase";

interface TeamChartProps {
  teamIds: number[];
  loading?: boolean;
}

const TeamChart: React.FC<TeamChartProps> = ({ teamIds, loading = false }) => {
  const { episodeId } = useEpisodeId();
  const queryClient = useQueryClient();

  const tournamentList = useTournamentList({ episodeId }, queryClient);
  const teamRatingHistories = useTeamsRatingHistoryList({ episodeId, teamIds });

  const ratingData: Record<string, ChartData[]> | undefined = useMemo(() => {
    if (!teamRatingHistories.isSuccess) return undefined;
    return formatRatingHistory(teamRatingHistories.data);
  }, [teamRatingHistories]);

  const tournamentData: PlotLine[] | undefined = useMemo(() => {
    if (!tournamentList.isSuccess) return undefined;
    return formatTournamentList(tournamentList.data.results ?? []);
  }, [tournamentList]);

  return (
    <ChartBase
      yAxisLabel="Rating"
      values={ratingData}
      loading={loading || teamRatingHistories.isLoading}
      loadingMessage="Loading rating data..."
      plotLines={tournamentData}
      crownTop={true}
    />
  );
};

export default TeamChart;
