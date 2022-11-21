/**
 * Process the response JSON for all errors and produce
 * an array of [field, error message] pairs.
 * Handles a "profile" where the basic information is
 * assumed to be a nested field of this profile.
 * (For example, "user" inside a "UserProfile".)
 */
function get_profile_errors(model, response_json) {
  const errors = [];
  if (response_json[model]) {
    for (const [field, error_message] of Object.entries(response_json.user)) {
      errors.push([field, error_message]);
    }
  }
  for (const [field, error_message] of Object.entries(response_json)) {
    if (field == model) continue;
    errors.push([field, error_message]);
  }
  return errors;
}

function get_user_errors(response_json) {
  return get_profile_errors("user", response_json);
}

function get_team_errors(response_json) {
  return get_profile_errors("team", response_json);
}

export { get_user_errors, get_team_errors };
