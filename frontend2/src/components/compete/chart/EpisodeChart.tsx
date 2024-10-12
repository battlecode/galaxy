import type React from "react";
import { useMemo, useState } from "react";
import { useEpisodeList, useTournamentList } from "api/episode/useEpisode";
import SelectMenu from "../../elements/SelectMenu";
import TeamChart, { type ChartData } from "./TeamChart";
import { useUserRatingHistoryList } from "api/compete/useCompete";
import { useQueryClient } from "@tanstack/react-query";
import { useEpisodeId } from "contexts/EpisodeContext";

const EpisodeChart: React.FC = () => {
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
    const ratingRecord: Record<string, ChartData[]> = {};
    return ratingHistory.data.reduce((record, teamData) => {
      if (teamData.team_rating !== undefined) {
        record[teamData.team_rating.team.name] =
          teamData.team_rating.rating_history.map((match) => [
            match.timestamp.getTime(),
            match.rating,
          ]);
      }
      return record;
    }, ratingRecord);
  }, [ratingHistory]);

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

      <TeamChart
        yAxisLabel="Rating"
        values={ratingData}
        loading={ratingHistory.isLoading}
        loadingMessage="Loading rankings data..."
      />
    </div>
  );
};

export default EpisodeChart;
