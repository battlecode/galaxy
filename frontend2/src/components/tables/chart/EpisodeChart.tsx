import React from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import TeamChart from "./TeamChart";
import * as chart from "./chartUtil";
import * as random_data from "./randomData";

export interface EpisodeChartProps {
  episodes: string[];
}

const EpisodeChart = ({ episodes }: EpisodeChartProps): JSX.Element => {
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
};

export default EpisodeChart;
