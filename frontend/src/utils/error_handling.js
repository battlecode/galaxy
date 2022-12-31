// Recursive parser for an error from the backend.
// Assumes that errors are JS objects (dictionaries),
// whose keys are fields,
// and whose values are either list of strings, or another "error" (recursive).

// Return a flat array of error "messages",
// where a message is an object with keys of "field" and "msg".

function parse_errors(input) {
  result = [];
  for (const [field, msg_list_or_error] of Object.entries(input)) {
    if (Array.isArray(msg_list_or_error)) {
      // is a list of messages
      for (msg of msg_list_or_error) {
        result.push({ field: field, msg: msg });
      }
    }

    // If not array, then most likely another (recursive) error
    else {
      result = result.concat(parse_errors(msg_list_or_error));
    }
  }
  return result;
}

export { parse_errors };
