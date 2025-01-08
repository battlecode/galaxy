/*
 * estDateStr: "Saturday, October 14, 2023 at 1:37 PM",
 * localDateStr: "Saturday, October 14, 2023 at 2:37 PM",
 * localTimezone: "EDT",
 * localFullString: "Saturday, October 14, 2023 at 2:37 PM EDT"
 * shortDateStr: "10/14/2023"
 * localShortStr: "10/14/2023 at 2:37 PM EDT"
 * zeroOffsetShortStr: "10/14/2023"
 */
interface DateTimeStrings {
  estDateStr: string;
  localDateStr: string;
  localTimezone: string;
  localFullString: string;
  shortDateStr: string;
  localShortStr: string;
  zeroOffsetShortStr: string;
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

  const shortDateStr = date.toLocaleDateString("en-US", { timeZone: "EST" });

  const localShortStr = date.toLocaleTimeString("en-US", {
    timeZone: "EST",
    timeZoneName: "short",
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const zeroOffsetShortStr = date.toLocaleDateString("en-US", {
    timeZone: "UTC",
  });

  return {
    estDateStr,
    localDateStr,
    localTimezone,
    localFullString: `${localDateStr} ${localTimezone}`,
    shortDateStr,
    localShortStr,
    zeroOffsetShortStr,
  };
};
