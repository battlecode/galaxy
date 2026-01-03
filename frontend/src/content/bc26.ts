import type {
  QuickStartPageKey,
  ResourcesPageKey,
  DebuggingTipsPageKey,
  CommonIssuesPageKey,
  TourneyPageKey,
} from "./ContentStruct";

export const QUICKSTART: Partial<Record<QuickStartPageKey, string>> = {
  Overview: `
This is the Battlecode 2026 contest website, which will be your main hub for all Battlecode-related things for the duration of the contest. For a general overview of what Battlecode is, visit [our landing page](https://battlecode.org/).

*Deep beneath the abandoned dorms of MIT, thanks to a student letting their failed final project loose on campus, a robotic rat society has formed. Like all developing societies, there is, of course, conflict. It is not chromatic, but it is dangerous. You have heard tales of many large, hungry robot cats (someone else’s failed project, probably) that are on the prowl for sustenance. As such, your society and a nearby society have formed an uneasy alliance.*

*Before you begin dragging in enemy rats as sacrifices, you must remember the task you were born with: protect your mother, the big fat Rat King.*

`,
  "Account and Team Creation": `
To participate in Battlecode, you need an account and a team. Each team can consist of 1 to 4 people.

[Create an account](/register) on this website, and then go to the [team section](/bc26/my_team) to either create or join a team.

If you need to rename your team for any reason, please reach out to Teh Devs on [Discord](https://discord.gg/N86mxkH) or at [battlecode@mit.edu](mailto:battlecode@mit.edu).

`,

  "Installation and Setup": `
Coming soon!
`,
};

export const RESOURCES: Partial<Record<ResourcesPageKey, string>> = {
  "Coding Resources": `

If you're just starting out, check out the [quick start](/bc26/quick_start) page!

For more helpful resources while coding, see:

- [Common Issues](/bc26/common_issues)
- [Debugging Tips](/bc26/debugging_tips)

`,
  "Third-party Tools": `

The tools below were made by contestants! They haven't been tested by the devs, but might prove to be very helpful in developing your bot.

If you make a new tool that could be useful to others, please post it in the [#open-source channel](https://discord.gg/N86mxkH) on the Discord. Everyone will love you!!

- There is nothing here yet...

`,
  Lectures: `

Battlecode 2026 will be holding lectures, where a dev will be going over possible strategy, coding up an example player, answering questions, etc. You do not have to be an MIT student to view our lectures, and they are open to everyone! The lectures are beginner-friendly and are stongly recommended for both newcomers and past participants.

All lectures are streamed live on and later uploaded to [our YouTube page](https://www.youtube.com/@MITBattlecode).
`,
};

export const DEBUGGINGTIPS: Partial<Record<DebuggingTipsPageKey, string>> = {
  Debugging: `
Coming soon!
  `,
};

export const COMMONISSUES: Partial<Record<CommonIssuesPageKey, string>> = {
  "Installation Issues": `
Coming soon!
`,
};

export const TOURNAMENTS: Partial<Record<TourneyPageKey, string>> = {
  "Tournament Schedule": `
Battlecode 2026 will have several tournaments throughout the month! We stream and commentate all tournaments online.

The deadline to submit code for each non-final tournament is usually 7 pm EST *the day before* the tournament.

Please note that **all times on this page are in your current time zone**. Refer to the submission freeze countdown timer for the time remaining before the next submission freeze.

The tournament schedule will be released before the contest begins. Please check back later!
`,
  Prizes: `Coming soon!`,
};
