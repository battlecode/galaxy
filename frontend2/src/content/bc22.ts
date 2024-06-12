import type { TourneyPageKey } from "./ContentStruct";

export const BC22_QUICKSTART = `# Quick Start 22

This is the Battlecode 2022 contest website, which will be your main hub for all Battlecode-related things for the duration of the contest. For a general overview of what Battlecode is, visit [our landing page](https://battlecode.org/).

## Create an account and team

To participate in Battlecode, you need an account and a team. Each team can consist of 1 to 4 people.

[Create an account](/register) on this website, and then go to the [team section](/bc22/team) to either create or join a team.

## Installation

### Step 1: Install Java

You'll need a Java Development Kit (JDK) version 8. Unfortunately, higher versions will not work. [Download it here](http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html). You may need to create an Oracle account.

- Alternatively, you can install a JDK yourself using your favorite package manager. Make sure it's an Oracle JDK — we don't support anything else — and is compatible with Java 8.

If you're unsure how to install the JDK, you can find instructions for all operating systems [here](https://docs.oracle.com/javase/8/docs/technotes/guides/install/install_overview.html) (pay attention to \`PATH\` and \`CLASSPATH\`).

### Step 2: Download Battlecode

Next, you should download the [Battlecode 2022 scaffold](https://github.com/battlecode/battlecode22-scaffold). To get up and running quickly, you can click "Clone or download" and then "Download ZIP," and move on to the next step.

TODO: the rest of the page

`;

export const BC22_RESOURCES = `# Markdown syntax guide 22

# This is a Heading h1
## This is a Heading h2
###### This is a Heading h6

*This text will be italic*
_This will also be italic_

**This text will be bold**
__This will also be bold__

_You **can** combine them_

### Unordered List

* Item 1
* Item 2
* Item 2a
* Item 2b

### Ordered List

1. Item 1
1. Item 2
1. Item 3
  1. Item 3a
  1. Item 3b

![This is an alt text for an image.](/image/sample.png "This is a sample image.")

[This links to example.com](https://example.com).

\`\`\`
let message = 'Hello world';
alert(message);
\`\`\`

this is \`an inline code block\`
`;

export const BC22_TOURNAMENTS: Record<TourneyPageKey, string> = {
  schedule: `# Battlecode 2022 Tournament Schedule

  Battlecode 2022 will have several tournaments throughout the month! We stream and commentate all tournaments online. The deadline to submit code for each non-final tournament is usually 7 pm EST the day before the tournament.
  `,
  prizes: `# Prizes

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
  format: `# Tournament Format

  Each match within a tournament will consist of at least 3 games, each on a different map, and the team that wins the most games will advance.

  Scrimmage rankings will be used to determine seeds for all tournaments. Ties will be broken by Sprint tournament rankings.

  Tournaments will be in a double elimination format, with the exception of both Sprint Tournaments, which are single elimination. The Final Tournament will start with a blank slate (any losses from the Qualifying Tournament are reset).

  Even if you miss earlier tournaments, you can participate in later tournaments (except the Final Tournament). This includes the Qualifying Tournament — you can participate even if you miss every other tournament (your seed will be determined by your scrimmage rank).
  `,
  rules: `# Eligibility Rules

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
