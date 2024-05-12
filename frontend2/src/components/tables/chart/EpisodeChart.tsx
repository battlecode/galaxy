import React, { useMemo, useState, Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import Highcharts from "highcharts";
import { useEpisodeList } from "api/episode/useEpisode";
import Icon from "../../elements/Icon";
import SelectMenu from "../../elements/SelectMenu";
import HighchartsReact from "highcharts-react-official";
import TeamChart, { type ChartData } from "./TeamChart";
import { useSearchTeams } from "api/team/useTeam";
import { useTopRatingHistoryList } from "api/compete/useCompete";
import { useQueryClient } from "@tanstack/react-query";
import * as chart from "./chartUtil";
import * as random_data from "./randomData";

const EpisodeChart = (): JSX.Element => {
  const queryClient = useQueryClient();
  const [episode, setEpisode] = useState("bc23");
  const { data: episodeList } = useEpisodeList({ page: 1 }, queryClient);
  const topRatingHistory = useTopRatingHistoryList(
    { episodeId: episode },
    queryClient,
  );
  const idToName = useMemo(
    () =>
      new Map(
        (episodeList?.results ?? []).map((ep) => [ep.name_short, ep.name_long]),
      ),
    [episodeList],
  );


  const ratingData: Record<string, ChartData[]> | undefined = useMemo(() => {
    if (!topRatingHistory.isSuccess) return undefined;
    const ratingRecord: Record<string, ChartData[]> = {};
    return topRatingHistory.data.reduce((record, teamData) => {
      if (teamData.team_rating !== undefined) {
        record[teamData.team_rating.team.name] =
          teamData.team_rating.rating_history.map((match) => [
            match.timestamp.getTime(),
            match.rating,
          ]);
      }
      return record;
    }, ratingRecord);
  }, [topRatingHistory]);

  console.log(ratingData);

  let options = [{value: "", label: ""}];

  if (episodeList?.results !== undefined) {
	  options = episodeList.results.map((e) => {return {value: e.name_short, label: e.name_long};});
  }


  return (
    <div>
      <SelectMenu
        options={options}
        label={"Select Year"}
        value={episode}
        onChange={setEpisode}
      />

      <TeamChart
        yAxisLabel="Rating"
        values={ratingData}
        loading={topRatingHistory.isLoading}
        loadingMessage="Loading rankings data..."
		plotLines={[
		["Tournament 1", 1673156004189],
		["Tournament 2", 1673164004189],
		]}
      />
    </div>
  );
};

export default EpisodeChart;
