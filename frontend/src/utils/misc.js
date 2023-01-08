export function trimUsername(username, length) {
  if (username.length > length) {
    return username.slice(0, length - 1) + "...";
  }
  return username;
}
