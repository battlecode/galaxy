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

function print_errors(input) {
  const errors = parse_errors(input);

  if (errors.length === 1) {
    const error = errors[0];
    return `Error in field ${error.field}: ${error.msg}`;
  } else {
    return `Errors: \n${errors
      .map((error) => `In field ${error.field}: ${error.msg}`)
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
