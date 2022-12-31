// Recursive parser for an error from the backend.
// Assumes that errors are JS objects (dictionaries),
// whose keys are fields,
// and whose values are either list of strings, or another "error" (recursive).

// Return a flat array of error "messages",
// where a message is an object with keys of "field" and "msg".

// Inspired by https://stackoverflow.com/questions/32508521
// and adjusted and ported to JS.

function parse_errors(input, parent_field = null) {
  let result = [];
  for (let [field, msg_list_or_error] of Object.entries(input)) {
    field = toHeaderCase(field);

    if (Array.isArray(msg_list_or_error)) {
      // is a list of messages
      for (const msg of msg_list_or_error) {
        field = parent_field ? `${parent_field} -> ${field}` : field;
        result.push({ field: field, msg: msg });
      }
    }

    // If not array, then most likely another (recursive) error
    else {
      result = result.concat(parse_errors(msg_list_or_error, field));
    }
  }
  return result;
}

// Helper to convert snake_case to Header Case,
// for prettier error messages.
// Ripped from https://github.com/huynhsamha/js-convert-case/blob/master/src/modules/js-headercase/index.ts
// of https://www.npmjs.com/package/js-convert-case

function toHeaderCase(str) {
  if (!str) return "";

  return String(str)
    .replace(/^[^A-Za-z0-9]*|[^A-Za-z0-9]*$/g, "")
    .replace(/([a-z])([A-Z])/g, (m, a, b) => `${a}_${b.toLowerCase()}`)
    .replace(/[^A-Za-z0-9]+|_+/g, " ")
    .toLowerCase()
    .replace(
      /( ?)(\w+)( ?)/g,
      (m, a, b, c) => a + b.charAt(0).toUpperCase() + b.slice(1) + c
    );
}

function print_errors(xhr) {
  // For ease of debugging and customer service, dump to console.
  // (So that Teh Devs can ask users to open console when things go wrong)
  // This isn't a security hole; all info here is visible from the browser anyways,
  // sometimes with some extra annoying clicks.
  console.log("Error:");
  console.log(xhr);
  console.log("Error JSON, if exists:");
  console.log(xhr.responseJSON);

  // We parse errors from the response JSON.
  const input = xhr.responseJSON;

  // Just in case...
  if (!input) {
    return `There was an error. See your browser console or ask Teh Devs for assistance.`;
  }

  // Most of the time, errors come from serializers, and the errors are large objects.
  // However, the backend errors can be simple "{detail: ...}"
  // Handle those.
  if (input.detail && Object.keys(input).length === 1) {
    return `Error: ${input.detail}`;
  }

  // Similar for "non_field_errors"
  // Note that doing this check for detail, non_field_errors, and many more
  // can get repetitive...find a DRY way for this if needed later.
  if (input.non_field_errors && Object.keys(input).length === 1) {
    return `Error: ${input.non_field_errors}`;
  }

  const errors = parse_errors(input);

  if (errors.length === 1) {
    const error = errors[0];
    return `Error in ${error.field}: ${error.msg}`;
  } else {
    return `Errors:\n${errors
      .map((error) => `In ${error.field}: ${error.msg}`)
      .join("\n")}`;
  }
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
  console.log(print_errors(error));

  error = {
    profile: {
      gender: ['"" is not a valid choice.'],
    },
  };
  console.log(print_errors(error));
}

export { print_errors };
