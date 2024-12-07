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
  "Tournament Schedule": `

  Battlecode 2023 will have several tournaments throughout the month! We stream and commentate all tournaments online. The deadline to submit code for each non-final tournament is usually 7 pm EST the day before the tournament.
  `,
  Prizes: `
  Prize amounts are approximate and will be finalized soon!

  * __Final Tournament prizes:__ Prizes will range from $5000 for 1st place to $600 for 16th place.
  * __Sprint prizes:__ Winner of each tournament will receive $250.
  * __Newbie, High School prizes:__ Prizes will range from $700 to $200 for the top 4 teams.
  * __[Best Devlog Series Prize](https://www.regression.gg/battlecode):__ $800 prize given by our Gold Sponsor,
    [Regression Games](https://www.regression.gg/). First place will receive $800, and all winners will receive a chance to interview for
    internships.
    * We want to see what you are building during the Battlecode season! Share your Battlecode development
      experience on your favorite social media platform over the course of the tournament. Post your
      learnings, fun moments, hardships, and progress! You must tag Battlecode and Regression Games in
      the post to be eligible for this prize (see [regression.gg/battlecode](https://regression.gg/battlecode) for more info, ideas, and social media handles).
  * __Best Strategy Report Prize:__ $800 prize given by our Gold Sponsor, [Argus Labs](https://argus.gg/).
    First place will receive $800, and all winners will receive a chance to interview for internships and a swag box.
    * Submit a strategy report detailing the strategies you used to develop your bot! We'd love to see how you handled
      communication, resource allocation, battling, and more. Tell us what unique strategies your team came up with!
      A link for submitting reports will be provided later.
  If you are an international participant, please note that [US export regulations](https://www.bis.doc.gov/index.php/policy-guidance/country-guidance/sanctioned-destinations)
  may restrict our ability to award prizes to students from certain countries.
  `,
  "Tournament Format": `
  Each match within a tournament will consist of at least 3 games, each on a different map, and the team that wins the most games will advance.

  Scrimmage rankings will be used to determine seeds for all tournaments. Ties will be broken by Sprint tournament rankings.

  Tournaments will be in a double elimination format, with the exception of both Sprint Tournaments, which are single elimination. The Final Tournament will start with a blank slate (any losses from the Qualifying Tournament are reset).

  Even if you miss earlier tournaments, you can participate in later tournaments (except the Final Tournament). This includes the Qualifying Tournament — you can participate even if you miss every other tournament (your seed will be determined by your scrimmage rank).
  `,
  "Eligibility Rules": `
  Anyone can write a bot, create a team, and participate in scrimmage matches/rankings. The Sprint Tournaments are
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
