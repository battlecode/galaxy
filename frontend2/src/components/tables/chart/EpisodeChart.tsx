import React from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import TeamChart from "./TeamChart";
import { useSearchTeams } from "api/team/useTeam";
import { useQueryClient } from "@tanstack/react-query";
import * as chart from "./chartUtil";
import * as random_data from "./randomData";

export interface EpisodeChartProps {
  episodes: string[];
}

const EpisodeChart = ({ episodes }: EpisodeChartProps): JSX.Element => {
  const queryClient = useQueryClient();
  const { data: rankingsData, isLoading: rankingsLoading } = useSearchTeams(
    {
      episodeId: "bc23",
      search: "",
      page: 1,
    },
    queryClient,
  );

  if (!rankingsLoading && rankingsData?.results !== undefined) {
    for (const team of rankingsData.results) {
      console.log(team.id);
    }
    console.log(rankingsData);
    return (
      <TeamChart
        yAxisLabel="Performance"
        values={{
          "Gone Sharkin": random_data.randomData1,
          bruteforcer: random_data.randomData2,
          Bear: random_data.randomData3,
          "cout for clout": random_data.randomData4,
          "don't eat my nonorientable shapes": random_data.randomData5,
          "I ran out of team names": random_data.randomData6,
          "I ran out of team names 2": random_data.randomData7,
          "I ran out of team names 3": random_data.randomData8,
          "I ran out of team names 100": random_data.randomData9,
        }}
      />
    );
  }

  return <TeamChart yAxisLabel="Performance" values={{}} />;
};

export default EpisodeChart;
