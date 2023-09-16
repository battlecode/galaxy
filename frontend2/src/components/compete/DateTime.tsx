interface DateTimeStrings {
  estDateStr: string;
  localDateStr: string;
  localTimezone: string;
  localFullString: string;
}

interface DateTimeProps {
  date: Date;
}

export const DateTime = ({ date }: DateTimeProps): DateTimeStrings => {
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

  return {
    estDateStr,
    localDateStr,
    localTimezone,
    localFullString: `${localDateStr} ${localTimezone}`,
  };
};
