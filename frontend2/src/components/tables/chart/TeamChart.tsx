import React, { useMemo } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import * as chart from "./chartUtil";

type UTCMilliTimestamp = number;

export type ChartData = [UTCMilliTimestamp, number];

// `yAxisLabel` is the name that is shown to the right of the graph.
//
// `values` holds a dict where the string keys are the name of the team, and
// the value is an array of arrays where the first spot is a UTC timestampm and
// the second is the ranking of that team. Example:
//
// { "Gone Sharkin" : [ [ 1673826806000.0, 1000 ], [1673826805999.0, 900], ... ], ...}
export interface TeamChartProps {
  yAxisLabel: string;
  values?: Record<string, ChartData[]>;
}

const TeamChart = ({ yAxisLabel, values }: TeamChartProps): JSX.Element => {
  // Translate values into Highcharts compatible options
  const seriesData: Highcharts.SeriesOptionsType[] | undefined = useMemo(() => {
    if (values === undefined) return undefined;
    return Object.keys(values).map((team) => ({
      type: "line",
      name: team,
      data: values[team],
      marker: {
        enabled: false,
        symbol: "circle",
      },
    }));
  }, [values]);

  // TODO: get loading to work! Ideally with a loading spinner :)
  const options: Highcharts.Options = {
    ...chart.highchartsOptionsBase,
    lang: {
      noData: "Loading...",
    },
    noData: {
      style: {
        fontWeight: "bold",
        fontSize: "18px",
        color: "teal",
      },
    },
    chart: {
      ...chart.highchartsOptionsBase.chart,
      height: 400,
    },
    yAxis: {
      title: {
        text: yAxisLabel,
      },
    },
    title: {
      text: "",
    },
    credits: {
      href: "https://jmerle.github.io/battlecode-2024-statistics/",
      text: "Inspired by jmerle",
    },
    tooltip: {
      ...chart.highchartsOptionsBase.tooltip,
      formatter: function () {
        // Add crown emoji on the top player at the time

        // Very first element is the header at the bottom
        const x: string | undefined = this?.x?.toString();
        let header = "ERROR";
        if (x !== undefined)
          header = Highcharts.dateFormat("%A, %e %b, %l:%M %p", Number(x));

        const names = [header];

        let max = -1;
        let index = -1;
        this?.points?.forEach((point, i) => {
          const y = point?.y ?? -1;
          let color: string | undefined = point?.color?.toString();
          if (color === undefined) color = "red";
          const circle = `<span class="circle" style="color: ${color};">●</span>`;
          if (y > max) {
            max = y;
            index = i;
          }
          names.push(
            circle + " " + point.series.name + ": <b>" + y.toString() + "</b>",
          );
        });

        if (index !== -1) names[index + 1] = "👑 " + names[index + 1];

        return names;
      },
    },
    series: seriesData ?? [],

    legend: {
      layout: "vertical",
      align: "right",
      verticalAlign: "top",
      width: 250,
      maxHeight: 1e6,
      alignColumns: false,
    },
  };

  return (
    <div>
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  );
};

export default TeamChart;
