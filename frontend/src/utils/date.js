function getDateTimeText(date) {
  // Use US localization for standardization in date format
  const est_date_str = date.toLocaleString("en-US", {
    timeZone: "EST",
    timeStyle: "short",
    dateStyle: "full",
  });

  // Allow for localization here
  const local_date_str = date.toLocaleString([], {
    timeStyle: "short",
    dateStyle: "full",
  });

  // See https://stackoverflow.com/questions/1954397/detect-timezone-abbreviation-using-javascript
  const local_timezone = date
    .toLocaleTimeString("en-us", { timeZoneName: "short" })
    .split(" ")[2];

  const local_full_string = `${local_date_str} ${local_timezone}`;

  return { est_date_str, local_date_str, local_timezone, local_full_string };
}

export { getDateTimeText };
