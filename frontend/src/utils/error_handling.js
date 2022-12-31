// Recursive parser for an error from the backend.
// Assumes that errors are JS objects (dictionaries),
// whose keys are fields,
// and whose values are either list of strings, or another "error" (recursive).

// Return a flat array of error "messages",
// where a message is an object with keys of "field" and "msg".

// Inspired by https://stackoverflow.com/questions/32508521
// and adjusted and ported to JS.

function parse_errors(input, parent_field = null) {
  result = [];
  for (const [field, msg_list_or_error] of Object.entries(input)) {
    if (Array.isArray(msg_list_or_error)) {
      // is a list of messages
      for (msg of msg_list_or_error) {
        // TODO convert field to uppercase, and possibly from snake case to regular uppercase too (no underscores)
        result_field = parent_field ? `${parent_field} -> ${field}` : field;
        result.push({ field: result_field, msg: msg });
      }
    }

    // If not array, then most likely another (recursive) error
    else {
      result = result.concat(parse_errors(msg_list_or_error, field));
    }
  }
  return result;
}

// Copy-paste into console for convenient testing.
// Add more test cases too, within the function, as desired.
function test() {
  error = {
    profile: {
      gender: ['"" is not a valid choice.'],
      country: ['"" is not a valid choice.'],
    },
    last_name: ["This field may not be blank."],
  };
  return parse_errors(error);
}

export { parse_errors };
