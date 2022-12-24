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
  const est_date_str = `${est_day_of_week}, ${est_string} Eastern Time`;

  // Allow for localization here
  const locale_string = date.toLocaleString();
  const locale_day_of_week = date.toLocaleString([], {
    weekday: "short",
  });
  const local_date_str = `${locale_day_of_week}, ${locale_string} in your locale and time zone`;

  return { est_date_str: est_date_str, local_date_str: local_date_str };
}

export { getDateTimeText };
