import React, { Component } from "react";
import type Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import HighchartsAccessibility from "highcharts/modules/accessibility";

export const dummyData = [
  ["2023-01-07T23:40:23.724944-05:00", 213],
  ["2023-01-07T23:40:38.190097-05:00", 393.07761467344426],
  ["2023-01-07T23:43:24.089644-05:00", 544.4392758936382],
  ["2023-01-08T01:17:24.776842-05:00", 695.800751650873],
  ["2023-01-08T01:43:12.890233-05:00", 825.5286444529454],
  ["2023-01-08T02:58:22.497562-05:00", 936.7912772869753],
  ["2023-01-08T03:07:17.220429-05:00", 1032.2947466200887],
  ["2023-01-08T04:23:55.062399-05:00", 1114.3493627397766],
  ["2023-01-21T16:13:47.898738-05:00", 237],
  ["2023-01-21T16:37:01.302090-05:00", 431.83569941362316],
  ["2023-01-21T16:37:02.076740-05:00", 589.7367139840902],
  ["2023-01-21T16:37:03.679759-05:00", 739.5747774074662],
  ["2023-01-22T20:55:41.267208-05:00", 851.8840585753301],
  ["2023-01-22T20:55:43.000873-05:00", 938.9285076344466],
  ["2023-01-22T20:56:15.282299-05:00", 1011.8802093710394],
  ["2024-01-27T23:25:46.234997-05:00", 0],
  ["2024-01-27T23:35:48.751288-05:00", 0],
  ["2024-02-01T10:06:43.283346-05:00", 0],
]; // From Lowell











export const tournaments = [
  ["Sprint 1", "2023-01-25T19:00:00-05:00"],
  ["Sprint 2", "2023-01-26T19:00:00-05:00"],
];

export const formatNumber = (value: number, decimals = 0): string => {
  return Number(value).toLocaleString(undefined, {
    minimumFractionDigits: decimals > 0 ? decimals : 0,
    maximumFractionDigits: decimals > 0 ? decimals : 0,
  });
};

export const highchartsOptionsBase: Highcharts.Options = {
  chart: {
    zooming: {
      type: "x",
    },
    panning: {
      enabled: true,
      type: "x",
    },
    panKey: "shift",
    numberFormatter: formatNumber,
  },
  time: {
    useUTC: true,
  },
  credits: {
    href: 'javascript:window.open("https://www.highcharts.com/?credits", "_blank")',
  },
  exporting: {
    sourceWidth: 1600,
    sourceHeight: 800,
    allowHTML: true,
  },
  xAxis: {
    type: "datetime",
    title: {
      text: "Local Date & Time",
    },
    crosshair: {
      width: 1,
    },
    dateTimeLabelFormats: {
      day: "%e %b",
      hour: "%I:%M %P",
      minute: "%I:%M:%S %P",
    },
    plotLines: tournaments.map(([name, timestamp]) => ({
      color: "#ccd6eb",
      zIndex: 1000,
      value: Date.parse(timestamp),
      label: {
        text: name,
        useHTML: true,
        x: 12,
        y: 0,
        rotation: 270,
        align: "left",
        verticalAlign: "bottom",
        style: {
          background: "rgba(255, 255, 255, 0.5)",
          color: "#000000",
          padding: "3px",
          border: "1px solid #ccd6eb",
          borderTop: "0",
        },
      },
    })),
  },
  yAxis: {
    allowDecimals: false,
  },
  tooltip: {
	split: true,
    valueDecimals: 0,
  },

  series: [
    {
      type: "line",
      name: "This is MY label",
      data: dummyData,
    },
  ],
};
