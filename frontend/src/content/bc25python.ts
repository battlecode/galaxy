import type {
  QuickStartPageKey,
  ResourcesPageKey,
  DebuggingTipsPageKey,
  CommonIssuesPageKey,
  TourneyPageKey,
} from "./ContentStruct";

export const QUICKSTART: Partial<Record<QuickStartPageKey, string>> = {
  Overview: `
This is the Battlecode 2025 Python contest website, which will be your main hub for all Battlecode-related things for the duration of the contest. For a general overview of what Battlecode is, visit [our landing page](https://battlecode.org/).

*The bread and food of yore has begun to run out, forcing robot society to adapt. Gone are the jovial ducks, replaced by steampunk robot bunnies who have converted their need for nutrients into a reliance on paint. These bunnies have become territorial, forming clans and defense formations to protect the resource that keeps them running.*

*For the past two centuries, these bunnies have stayed within their own territory, but clans have begun to degrade their environment and need to start branching out. Will these clans be able to expand their territory and generate enough paint to protect their families? Or will they stray too close to other clans and be wiped out in conflict?*
`,

  "Account and Team Creation": `
To participate in Battlecode, you need an account and a team. Each team can consist of 1 to 4 people. Anyone can upload a bot and participate in scrimmage matches, but only teams of MIT students can participate in tournaments.

[Create an account](/register) on this website, and then go to the [team section](/bc25python/team) to either create or join a team.`,
};

export const RESOURCES: Partial<Record<ResourcesPageKey, string>> = {
  "Game Specifications": `

[Specifications for Battlecode 2025 Python!](https://releases.battlecode.org/specs/battlecode25/3.0.5/specs.md.html)

[Documentation for Battlecode 2025 Python!](https://releases.battlecode.org/javadoc/battlecode25/3.0.5/index.html)

`,
  "Coding Resources": `

If you're just starting out, check out the [quick start](/bc25python/quickstart) page!

For more helpful resources while coding, see:

- [Common Issues](/bc25python/common_issues)
- [Debugging Tips](/bc25python/debugging_tips)

`,
  "Third-party Tools": `

The tools below were made by contestants! They haven't been tested by the devs, but might prove to be very helpful in developing your bot.

If you make a new tool that could be useful to others, please post it in the [#open-source channel](https://discord.gg/N86mxkH) on the Discord. Everyone will love you!!

- There is nothing here yet...

`,
  Lectures: `

Battlecode 2025 Python will be holding lectures, where a dev will be going over possible strategy, coding up an example player, answering questions, etc. You do not have to be an MIT student to view our lectures, and they are open to everyone! The lectures are beginner-friendly and are stongly recommended for both newcomers and past participants.

All lectures are streamed live on and later uploaded to [our YouTube page](https://www.youtube.com/@MITBattlecode).
`,
};

export const DEBUGGINGTIPS: Partial<Record<DebuggingTipsPageKey, string>> = {
  Debugging: `Debugging instructions coming soon!`,
};

export const COMMONISSUES: Partial<Record<CommonIssuesPageKey, string>> = {
  "Installation Issues": `Installation issue fixes coming soon!`,
};

export const TOURNAMENTS: Partial<Record<TourneyPageKey, string>> = {
  "Tournament Schedule": `
  Battlecode 2025 Python will have several tournaments throughout the month! We stream and commentate all tournaments online.

  The deadline to submit code for each non-final tournament is usually 7 pm EST *the day before* the tournament.

  `,
  Prizes: `
  Battlecode 2025 Python will have several tournaments throughout the month! We stream and commentate all tournaments online.
  Due to its experimental nature, we have not finalized the tournament schedule or prizes. Please check back later for more information.
  `,
  /*
  "Tournament Format": `

  Each match within a tournament will consist of at least 3 games, each on a different map, and the team that wins the most games will advance.

  Scrimmage rankings will be used to determine seeds for all tournaments. Ties will be broken by Sprint tournament rankings.

  Tournaments will be in a double elimination format, with the exception of both Sprint Tournaments, which are single elimination. The Final Tournament will start with a blank slate (any losses from the Qualifying Tournament are reset).

  Even if you miss earlier tournaments, you can participate in later tournaments (except the Final Tournament). This includes the Qualifying Tournament — you can participate even if you miss every other tournament (your seed will be determined by your scrimmage rank).
  `,
  "Eligibility Rules": `
  Anyone can write a bot, create a team, and participate in scrimmage matches/rankings. The Sprint Tournaments are open to everyone, but the other tournaments have stricter eligibility rules.

  Your team must meet **all three conditions** by a tournament's submission deadline to be eligible for it:

  1. Have uploaded a bot
  2. Have correctly indicated your eligibility on your Team Profile page
  3. Have all members upload a resume, at your personal profile page (This condition does not apply to the Sprint Tournaments).

  Additionally, tournament specific eligibility is listed below:

  - **Sprint Tournament:** All teams are eligible.
  - **US Qualifier:** Teams must **consist entirely of US college students** studying full-time, or in a transition phase.
  - **International Qualifier:** Teams must **consist entirely of college students** studying full-time, or in a transition phase, where at least one team member is not a US student.
  - **MIT Newbie Tournament:** Teams must **consist entirely of MIT students** who have never competed in Battlecode before.
  - **High School Tournament:** Teams must **consist entirely of high school students**.
  - **Final Tournament:** Teams must have qualified via the US or International Qualifier. The final match of the Newbie and High School tournaments will also be played at the final tournament.

  Contact us on [Discord](https://discord.gg/N86mxkH) or at [battlecode@mit.edu](mailto:battlecode@mit.edu) if you are unsure of your eligibility.
  `,
  */
};
