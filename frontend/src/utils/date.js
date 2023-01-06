function getDateTimeText(date) {
  // Use US localization for standardization in date format
  const est_string = date.toLocaleString("en-US", {
    timeZone: "EST",
  });
  // need to pass weekday here, since weekday isn't shown by default
  const est_day_of_week = date.toLocaleString("en-US", {
    timeZone: "EST",
    weekday: "short",
  });
  const est_date_str = `${est_day_of_week}, ${est_string}`;

  // Allow for localization here
  const locale_string = date.toLocaleString();
  const locale_day_of_week = date.toLocaleString([], {
    weekday: "short",
  });
  const local_date_str = `${locale_day_of_week}, ${locale_string}`;

  // See https://stackoverflow.com/questions/1954397/detect-timezone-abbreviation-using-javascript
  const local_timezone = date
    .toLocaleTimeString("en-us", { timeZoneName: "short" })
    .split(" ")[2];

  return { est_date_str, local_date_str, local_timezone };
}

export { getDateTimeText };
