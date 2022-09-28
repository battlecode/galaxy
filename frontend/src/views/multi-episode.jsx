import { Component } from "react";
import Cookies from "js-cookie";

// NOTE: Save extensions as strings, not numbers, since episodes could be strings too (eg Battlehack)
const EPISODES = ["2022", "2023"];

// NOTE: dictionary keys that are strings-of-numbers can just be numbers.
// The formatter will convert them as such,
// and the code will treat them the same way
const EPISODE_TO_EXTENSION = { 2022: "bc22", 2023: "bc23" };
const EPISODE_TO_SCAFFOLD = { 2022: "bc22", 2023: "bc23" };

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

  // TODO methods to derive file extension and scaffold link

  constructor(params) {
    super(params);
  }

  // TODO remove cookie based approach; use the above static methods
  render() {
    let input = prompt(
      "Please enter episode to change to, e.g. '2022'",
      "2022"
    );
    // this.EPISODES is an array; use "includes" or "of"
    if (this.EPISODES.includes(input)) {
      const episode = input;
      // these are dicts/JS objects; use "in" to query keys
      if (
        !(
          episode in this.EPISODE_TO_EXTENSION &&
          episode in this.EPISODE_TO_SCAFFOLD
        )
      ) {
        // To make sure we don't have glitchy file extensions or scaffold links.
        // If someone complains about this error message, fix those above dictionaries.
        alert("Episode not configured properly, contact Teh Devs");
      } else {
        Cookies.set("episode", episode);
        const extension = this.EPISODE_TO_EXTENSION[episode];
        const scaffold_link = this.EPISODE_TO_SCAFFOLD[episode];
        Cookies.set("episode-extension", extension);
        Cookies.set("episode-scaffold-link", scaffold_link);
      }
    } else {
      alert("Episode does not exist");
    }

    // Redirect to home page.
    // This is annoying for user experience quality of life, if they came from a different page...
    // but from a coding standpoint I can't think of how to do this easily.
    // Save URL in cookies?
    window.location.replace("/");
  }
}

export default MultiEpisode;
