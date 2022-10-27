import { Component } from "react";

// NOTE: Save extensions as strings, not numbers, since episodes could be strings too (eg Battlehack)
const EPISODES = ["2022", "2023"];

// NOTE: dictionary keys that are strings-of-numbers can just be numbers.
// The formatter will convert them as such,
// and the code will treat them the same way
const EPISODE_TO_EXTENSION = { 2022: "bc22", 2023: "bc23" };
const EPISODE_TO_SCAFFOLD_LINK = { 2022: "bc22", 2023: "bc23" };
const EPISODE_TO_SCAFFOLD_NAME = {
  2022: "battlecode22-scaffold",
  2023: "battlecode23-scaffold",
};
const DEFAULT_EPISODE = "2022";

class MultiEpisode extends Component {
  // TODO have two methods: getEpisodeCurrent(), and getEpisodeFromPathname(pathname)
  // to still have both convenience and flexibility

  // Given the window.location.pathname of a page (e.g. /2022/getting-started)
  // derives the episode from it.
  // (We use pathname as input, because JS's pathname does some useful work for us,
  // but we can't use it within the helper method)
  // NOTE: Assumes that when episodes are in URLs, the episode is the first part of the URL.
  // This is what we have done elsewhere, but is subject to change and this code would suddenly break.
  static getEpisodeFromPathname(pathname) {
    const parts = pathname.split("/");
    // Note that, if pathname begins with a /, parts[0] will be the empty string
    // (since split allows for empty strings as parts)
    const episodeInPathName = parts[1];

    // EPISODES is an array; use "includes" or "of"
    if (EPISODES.includes(episodeInPathName)) {
      return episodeInPathName;
    } else {
      // TODO redirect here, (not on the caller checking the result)
      return null;
    }
  }

  static getScaffoldName(episode) {
    return EPISODE_TO_SCAFFOLD_NAME[episode];
  }

  static getDefaultEpisode() {
    return DEFAULT_EPISODE;
  }

  constructor(params) {
    super(params);
  }

  render() {
    let input = prompt(
      `Please enter episode to change to, e.g. ${DEFAULT_EPISODE}`,
      DEFAULT_EPISODE
    );
    if (EPISODES.includes(input)) {
      window.location.replace(`/${input}`);
    } else {
      alert("Episode does not exist");
      history.back();
    }
  }
}

export default MultiEpisode;
