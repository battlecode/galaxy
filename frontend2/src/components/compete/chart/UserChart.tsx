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
import { useTeamsByUser } from "api/user/useUser";

interface UserChartProps {
  userId: number;
}

const UserChart: React.FC<UserChartProps> = ({ userId }) => {
  const { episodeId } = useEpisodeId();
  const queryClient = useQueryClient();

  const [selectedEpisode, setSelectedEpisode] = useState(episodeId);

  const episodeList = useEpisodeList({}, queryClient);
  const tournamentList = useTournamentList(
    { episodeId: selectedEpisode },
    queryClient,
  );
  const teamList = useTeamsByUser({ id: userId });
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

  const teamListMap = useMemo(
    () => new Map(Object.entries(teamList.data ?? {})),
    [teamList],
  );

  const episodeListFiltered = useMemo(
    () =>
      (episodeList.data?.results ?? []).filter((ep) =>
        teamListMap.has(ep.name_short),
      ),
    [episodeList],
  );

  return (
    <div className="flex flex-1 flex-col gap-8">
      <SelectMenu
        options={
          episodeListFiltered.map((ep) => ({
            value: ep.name_short,
            label: ep.name_long,
          })) ?? []
        }
        label={"Select Episode"}
        value={selectedEpisode}
        onChange={setSelectedEpisode}
        loading={tournamentList.isLoading}
      />

      {(episodeList.isLoading || teamList.isLoading) && (
        <span className="text-center text-xl italic">Loading team...</span>
      )}
      {episodeList.isSuccess && teamList.isSuccess && (
        <span className="text-center text-xl font-semibold">
          {teamListMap.get(selectedEpisode)?.name ?? "ERROR"}
        </span>
      )}

      <ChartBase
        yAxisLabel="Rating"
        values={ratingData}
        loading={ratingHistory.isLoading}
        loadingMessage="Loading rating data..."
        plotLines={tournamentData}
        crownTop={false}
      />
    </div>
  );
};

export default UserChart;
