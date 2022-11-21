/**
 * Process the response JSON for all errors and produce
 * an array of [field, error message] pairs.
 */
function get_user_errors(response_json) {
  const errors = [];
  if (response_json.user) {
    for (const [field, error_message] of Object.entries(response_json.user)) {
      errors.push([field, error_message]);
    }
  }
  for (const [field, error_message] of Object.entries(response_json)) {
    if (field == "user") continue;
    errors.push([field, error_message]);
  }
  return errors;
}

export default get_user_errors;
