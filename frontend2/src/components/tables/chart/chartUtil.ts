import type Highcharts from "highcharts";

// These are waypoints that are layered on top of the chart so it is easy to
// tell when certain dates occured. The data to the right is formatted to
// %Y-%m-%dT%H:%M:%S
export const tournaments = [
  ["Sprint 1", "2023-01-18T19:00:00-05:00"],
  ["Sprint 2", "2023-01-20T19:00:00-05:00"],
];

export const formatNumber = (value: number, decimals = 0): string =>
  Number(value).toLocaleString(undefined, {
    minimumFractionDigits: decimals > 0 ? decimals : 0,
    maximumFractionDigits: decimals > 0 ? decimals : 0,
  });

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
};
