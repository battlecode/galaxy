import React, { Component } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import HighchartsAccessibility from "highcharts/modules/accessibility";
import * as chart from "./chart";
import * as random_data from "./random_data";

const TeamChart = (): JSX.Element => {
  const options: Highcharts.Options = {
    ...chart.highchartsOptionsBase,
    chart: {
      ...chart.highchartsOptionsBase.chart,
      height: 400,
    },
    yAxis: {
      title: {
        text: "Performance",
      },
    },
    title: {
      text: "",
    },
    series: [
      {
        type: "line",
        name: "Gone Sharkin'",
        data: random_data.randomData1,
        marker: {
          enabled: false,
          symbol: "circle",
        },
      },

      {
        type: "line",
        name: "Bruteforcer",
        data: random_data.randomData2,
        marker: {
          enabled: false,
          symbol: "circle",
        },
      },

    ],

	legend: ({
      layout: 'vertical',
      align: 'right',
      verticalAlign: 'top',
      width: 250,
      maxHeight: 1e6,
      alignColumns: false,
    }),
  };

  return (
    <div>
      <HighchartsReact
        highcharts={Highcharts}
        options={options}
      />
    </div>
  );
};

export default TeamChart;
