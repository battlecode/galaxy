import type Highcharts from "highcharts";

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
    tickPixelInterval: 200,
    crosshair: {
      width: 1,
    },
    dateTimeLabelFormats: {
      day: "%e %b",
      hour: "%I:%M %P",
      minute: "%I:%M:%S %P",
    },
  },
  yAxis: {
    allowDecimals: false,
  },
  tooltip: {
    split: true,
    valueDecimals: 0,
  },
};
