import type React from "react";
import { useMemo, useState } from "react";
import { useEpisodeList, useTournamentList } from "api/episode/useEpisode";
import SelectMenu from "../../elements/SelectMenu";
import ChartBase from "./ChartBase";
import { useTeamRatingHistory } from "api/compete/useCompete";
import { useQueryClient } from "@tanstack/react-query";
import {
  formatRatingHistory,
  formatTournamentList,
  type PlotLine,
  type ChartData,
} from "./chartUtils";
import { useTeamsByUser } from "api/user/useUser";
import type { TeamPublic } from "api/_autogen";
import { isNil } from "lodash";

interface UserChartProps {
  userId: number;
  lockedEpisode?: string;
}

const UserChart: React.FC<UserChartProps> = ({ userId, lockedEpisode }) => {
  const queryClient = useQueryClient();

  const [selectedEpisode, setSelectedEpisode] = useState<string | undefined>();

  const episodeList = useEpisodeList({}, queryClient);
  const teamList = useTeamsByUser({ id: userId });

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

  const SHOW_SELECT = lockedEpisode === undefined;
  const EPISODE: string | undefined =
    lockedEpisode ?? selectedEpisode ?? episodeListFiltered[0]?.name_short;
  const TEAM: TeamPublic | undefined = teamListMap.get(EPISODE);

  return (
    <div className="flex flex-1 flex-col gap-8">
      {SHOW_SELECT && (
        <SelectMenu
          options={episodeListFiltered.map((ep) => ({
            value: ep.name_short,
            label: ep.name_long,
          }))}
          label={"Select Episode"}
          value={EPISODE}
          onChange={setSelectedEpisode}
          loading={episodeList.isLoading || teamList.isLoading}
          disabled={episodeList.isLoading || episodeList.isError}
        />
      )}

      {(episodeList.isLoading || teamList.isLoading) && (
        <span className="text-center text-xl italic">Loading team...</span>
      )}
      {episodeList.isSuccess && teamList.isSuccess && (
        <span className="text-center text-xl font-semibold">
          {TEAM?.name ?? "Couldn't Load Team"}
        </span>
      )}

      {episodeList.isSuccess && teamList.isSuccess && !isNil(TEAM) && (
        <ChartSection episodeId={EPISODE} teamId={TEAM.id} />
      )}
    </div>
  );
};

interface ChartSectionProps {
  episodeId: string;
  teamId: number;
}

const ChartSection: React.FC<ChartSectionProps> = ({ episodeId, teamId }) => {
  const queryClient = useQueryClient();

  const tournamentList = useTournamentList({ episodeId }, queryClient);
  const ratingHistory = useTeamRatingHistory({
    episodeId,
    teamId,
  });

  const ratingData: Record<string, ChartData[]> | undefined = useMemo(() => {
    if (!ratingHistory.isSuccess) return undefined;
    return formatRatingHistory([ratingHistory.data]);
  }, [ratingHistory]);

  const tournamentData: PlotLine[] | undefined = useMemo(() => {
    if (!tournamentList.isSuccess) return undefined;
    return formatTournamentList(tournamentList.data.results ?? []);
  }, [tournamentList]);

  return (
    <ChartBase
      yAxisLabel="Rating"
      values={ratingData}
      loading={ratingHistory.isLoading}
      loadingMessage="Loading rating data..."
      plotLines={tournamentData}
      crownTop={false}
    />
  );
};

export default UserChart;
