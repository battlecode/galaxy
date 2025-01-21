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

[Create an account](/register) on this website, and then go to the [team section](/bc25python/my_team) to either create or join a team.`,

  "Installation and Setup": `

Check [common issues](/bc25python/common_issues/) if you experience problems with the instructions below, and if that doesn't help, ask on the Discord.

### Step 1: Install Python

You'll need Python 3.12. Other versions will not work. [Download it here](https://www.python.org/downloads/release/python-3128/). Once you have installed Python, make sure this Python installation is the one you are using when you run Battlecode (you can check the version with \`python --version\`).

### Step 2: Download Battlecode

Next, you should download the [Battlecode 2025 scaffold](https://github.com/battlecode/battlecode25-scaffold). To get up and running quickly, you can click "Clone or download" and then "Download ZIP," and move on to the next step.

We recommend, however, that you instead use Git to organize your code. If you haven't used Git before, read [this guide](https://docs.github.com/en/get-started/using-git/about-git) (or wait for our lecture covering it). On the [scaffold page](https://github.com/battlecode/battlecode25-scaffold), click "Use this template." Importantly, on the next page, make your new repo private (you don't want other teams to view your code!). You can then clone your newly created repo and invite your team members to collaborate on it.

### Step 3: Local Setup
You can work on Battlecode using any text editor or Python IDE. It's easiest to run Battlecode Python from the terminal.

First, go to the python folder in the scaffold. The run.py script lets you do all the tasks you might need to do for Battlecode, like installing new engine / client versions, running your bot, and zipping your bot to submit. To install the engine and client, run \`python ./run.py update\`.

There should now be a folder called \`client\` in your scaffold folder; if you go in there, and double click the \`Battlecode Client\` application, you should be able to run and watch matches. (Please don't move that application, it will be sad). If you notice any severe issues with the default client, you can try setting the \`compatibility_client\` property to true in \`properties.json\` and updating the client.

### Developing Your Bot
Place each version of your robot in a new subfolder in the \`src\` folder. Make sure every version has a \`bot.py\`.
Check [debugging tips](/bc25python/debugging_tips) if you experience problems while developing, or ask on the Discord.

### RUNNING BATTLECODE FROM THE CLIENT
Open the client as described in Step 3. Navigate to the runner tab, select which bots and maps to run, and hit Run Game! Finally, click the play/pause button to view the replay.
You can run games directly from the terminal with the gradle task \`./run.py run --maps [map] --p1 [player 1 name] --p2 [player 2 name]\`. If you don't include the map or team flags, Battlecode will default to an example player and example map.

Note that you can also use the web client located at [https://play.battlecode.org/bc25python/client](/bc25python/client) if you are having issues running the client locally.
`,
};

export const RESOURCES: Partial<Record<ResourcesPageKey, string>> = {
  "Coding Resources": `

If you're just starting out, check out the [quick start](/bc25python/quick_start) page!

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
  Debugging: `With the current configuration of Battlecode Python, it is not possible for debugging programs to access your code. The easiest way to debug is using either \`print\` statements or the \`set_indicator_string\`, \`set_indicator_line\`, and \`set_indicator_dot\` functions.`,
};

export const COMMONISSUES: Partial<Record<CommonIssuesPageKey, string>> = {
  "Installation Issues": `Installation issue fixes coming soon! If you run into any issues, please let us know in the Discord!`,
  "Client Issues": `

If you're experiencing memory problems with the client, please try:

  - Making .bc25 files with the engine directly and uploading them to the client's match queue, rather than using the client's runner. The web client can be found at [https://play.battlecode.org/bc25python/client](/bc25python/client) and can be used in place of the desktop application.
    `,
};

export const TOURNAMENTS: Partial<Record<TourneyPageKey, string>> = {
  "Tournament Schedule": `
  Battlecode 2025 Python will have several tournaments throughout the month! We stream and commentate all tournaments online.

  The deadline to submit code for each non-final tournament is usually 7 pm EST *the day before* the tournament.

  Please note that **all times on this page are in your current time zone**. Refer to the submission freeze countdown timer for the time remaining before the next submission freeze.
  `,
  Prizes: `
- **Final Tournament Prizes:** 1st place winner will receive $600, and 2nd place winner will receive $400.
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
