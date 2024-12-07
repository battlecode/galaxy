/*
 * estDateStr: "Saturday, October 14, 2023 at 1:37 PM",
 * localDateStr: "Saturday, October 14, 2023 at 2:37 PM",
 * localTimezone: "EDT",
 * localFullString: "Saturday, October 14, 2023 at 2:37 PM EDT"
 * shortDateStr: "10/14/2023"
 */
interface DateTimeStrings {
  estDateStr: string;
  localDateStr: string;
  localTimezone: string;
  localFullString: string;
  shortDateStr: string;
}

export const dateTime = (date: Date): DateTimeStrings => {
  const estDateStr = date.toLocaleString("en-US", {
    timeZone: "EST",
    timeStyle: "short",
    dateStyle: "full",
  });
  const localDateStr = date.toLocaleString([], {
    timeStyle: "short",
    dateStyle: "full",
  });
  const localTimezone = date
    .toLocaleTimeString("en-us", { timeZoneName: "short" })
    .split(" ")[2];

  const shortDateStr = date.toLocaleDateString("en-US");

  return {
    estDateStr,
    localDateStr,
    localTimezone,
    localFullString: `${localDateStr} ${localTimezone}`,
    shortDateStr,
  };
};
