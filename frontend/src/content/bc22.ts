import type {
  CommonIssuesPageKey,
  DebuggingTipsPageKey,
  QuickStartPageKey,
  ResourcesPageKey,
  TourneyPageKey,
} from "./ContentStruct";

export const QUICKSTART: Partial<Record<QuickStartPageKey, string>> = {};

export const RESOURCES: Partial<Record<ResourcesPageKey, string>> = {};

export const DEBUGGINGTIPS: Partial<Record<DebuggingTipsPageKey, string>> = {};

export const COMMONISSUES: Partial<Record<CommonIssuesPageKey, string>> = {};

export const TOURNAMENTS: Partial<Record<TourneyPageKey, string>> = {
  "Tournament Schedule": `# Battlecode 2022 Tournament Schedule

  Battlecode 2022 will have several tournaments throughout the month! We stream and commentate all tournaments online. The deadline to submit code for each non-final tournament is usually 7 pm EST the day before the tournament.
  `,
  Prizes: `No prize information for this year, sorry!`,
  "Tournament Format": `Each match within a tournament will consist of at least 3 games, each on a different map, and the team that wins the most games will advance.

  Scrimmage rankings will be used to determine seeds for all tournaments. Ties will be broken by Sprint tournament rankings.

  Tournaments will be in a double elimination format, with the exception of both Sprint Tournaments, which are single elimination. The Final Tournament will start with a blank slate (any losses from the Qualifying Tournament are reset).

  Even if you miss earlier tournaments, you can participate in later tournaments (except the Final Tournament). This includes the Qualifying Tournament — you can participate even if you miss every other tournament (your seed will be determined by your scrimmage rank).
  `,
  "Eligibility Rules": `Anyone can write a bot, create a team, and participate in scrimmage matches/rankings. The Sprint Tournaments are
  open to everyone, but the other tournaments have stricter eligibility rules.

  Your team must meet __all three conditions__ by a tournament's submission deadline to be eligible for it:

  1. Have uploaded a bot
  1. Have correctly indicated your eligibility on your Team Profile page
  1. Have all members upload a resume, at your personal profile page (This condition does not apply to the Sprint Tournaments).

  Additionally, tournament specific eligibility is listed below:

  * __Sprint Tournament:__ All teams are eligible.
  * __US Qualifier:__ Teams must __consist entirely of US college students__ studying full-time, or in a transition phase.
  * __International Qualifier:__ Teams must __consist entirely of college students__ studying full-time, or in a transition phase,
    where at least one team member is not a US student.
  * __MIT Newbie Tournament:__ Teams must __consist entirely of MIT students__ who have never competed in Battlecode before.
  * __High School Tournament:__ Teams must __consist entirely of high school students__.
  * __Final Tournament:__ Teams must have qualified via the US or International Qualifier. The final match of the Newbie and High School tournaments will also be played at the final tournament.

  Contact us on [Discord](https://discord.gg/N86mxkH) or at [battlecode@mit.edu](mailto:battlecode@mit.edu) if you are unsure of your eligibility.
  `,
};
