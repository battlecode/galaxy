import type { TourneyPageKey } from "./ContentStruct";

export const BC24_QUICKSTART = `# Quick Start

## Overview

This is the Battlecode 2023 contest website, which will be your main hub for all Battlecode-related things for the duration of the contest. For a general overview of what Battlecode is, visit [our landing page](https://battlecode.org/).

## Account and Team Creation

To participate in Battlecode, you need an account and a team. Each team can consist of 1 to 4 people.

[Create an account](/register) on this website, and then go to the [team section](/bc24/team) to either create or join a team.

## Installation

Check [common issues](/bc24/common-issues/) if you experience problems with the instructions below, and if that doesn't help, ask on the Discord.

### Step 1: Install Java

You'll need a Java Development Kit (JDK) version 8. Unfortunately, higher versions will not work. [Download it here](http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html). You may need to create an Oracle account.

- Alternatively, you can install a JDK yourself using your favorite package manager. Make sure it's an Oracle JDK — we don't support anything else — and is compatible with Java 8.

If you're unsure how to install the JDK, you can find instructions for all operating systems [here](https://docs.oracle.com/javase/8/docs/technotes/guides/install/install_overview.html) (pay attention to \`PATH\` and \`CLASSPATH\`).

### Step 2: Download Battlecode

Next, you should download the [Battlecode 2024 scaffold](https://github.com/battlecode/battlecode24-scaffold). To get up and running quickly, you can click "Clone or download" and then "Download ZIP," and move on to the next step.

We recommend, however, that you instead use Git to organize your code. If you haven't used Git before, read [this guide](https://docs.github.com/en/get-started/using-git/about-git) (or wait for our lecture covering it). On the [scaffold page](https://github.com/battlecode/battlecode24-scaffold), click "Use this template." Importantly, on the next page, make your new repo private (you don't want other teams to steal your code!). You can then clone your newly created repo and invite your team members to collaborate on it.

### Step 3: Local Setup
We recommend using an IDE like IntelliJ IDEA or Eclipse to work on Battlecode, but you can also use your favorite text editor combined with a terminal. Battlecode 2024 uses Gradle to run tasks like \`run\`, \`debug\` and \`jarForUpload\` (but don't worry about that — you don't need to install it).

#### IntelliJ IDEA
- Install IntelliJ IDEA Community Edition [from here](https://www.jetbrains.com/idea/download/).
- In the \`Welcome to IntelliJ IDEA\` window that pops up when you start IntelliJ, select \`Import Project\`
- In the \`Select File or Dictionary to Import\` window, select the \`build.gradle\` file in the scaffold folder.
- Hit OK.
- We need to set the jdk properly; open the settings with \`File > Settings\` (\`IntelliJ IDEA > Preferences\` on Mac) or \`ctrl+alt+s\`. Navigate to \`Build, Execution, Deployment > Build Tools > Gradle\` and change \`Gradle JVM\` to 1.8
- Time for a first build! On the right side of the screen, click the small button that says gradle and has a picture of an elephant. Navigate to \`battlecode24-scaffold > Tasks > battlecode\` and double click on \`update\` and then \`build\`. This will run tests to verify that everything is working correctly, as well as download the client and other resources.
- If you haven't seen any errors, you should be good to go.

#### Eclipse
- Download the latest version of Eclipse [from here](https://www.eclipse.org/downloads/).
- In the Installer, select \`Eclipse IDE for Java Developers\`.
- Create a new Eclipse workspace. The workspace should NOT contain the \`battlecode24-scaffold\` folder.
- Run \`File -> Import...\`, and select \`Gradle / Existing Gradle Project\`.
- Next to \`Project root directory\` field, press \`Browse...\` and navigate to \`battlecode24-scaffold\`. Finish importing the project.
- If you do not see a window labeled \`Gradle Tasks\`, navigate to \`Window / Show View / Other...\`. Select \`Gradle / Gradle Tasks\`.
- In the \`Gradle Tasks\` window, you should now see a list of available Gradle tasks. Open the \`battlecode24-scaffold\` folder and navigate to the\`battlecode\` group, and then double-click \`update\` and \`build\`. This will run tests to verify that everything is working correctly, as well as download the client and other resources.
- You're good to go; you can run other Gradle tasks using the other options in the \`Gradle Tasks\` menu. Note that you shouldn't need any task not in the \`battlecode\` group.


#### Terminal
- Start every Gradle command with \`./gradlew\`, if using Mac or Linux, or \`gradlew\`, if using Windows.
- You will need to set the \`JAVA_HOME\` environment variable to point to the installation path of your JDK.
- Navigate to the root directory of your \`battlecode24-scaffold\`, and run \`./gradlew update\` and then \`./gradlew build\` (or \`gradlew build\` on Windows). This will run tests to verify that everything is working correctly, as well as download the client and other resources.
- You're good to go. Run \`./gradlew -q tasks\` (\`gradlew -q tasks\` on Windows) to see the other Gradle tasks available. You shouldn't need to use any tasks outside of the \`battlecode\` group.


There should now be a folder called \`client\` in your scaffold folder; if you go in there, and double click the \`Battlecode Client\` application, you should be able to run and watch matches. (Please don't move that application, it will be sad.) If you notice any severe issues with the default client, you can try setting the \`compatibilityClient\` gradle property to true to download the compatibility version.

### Developing Your Bot
Place each version of your robot in a new subfolder in the \`src\` folder. Make sure every version has a \`RobotPlayer.java\`.
Check [debugging tips](bc24/debugging-tips) if you experience problems while developing, or ask on the Discord.

### RUNNING BATTLECODE FROM THE CLIENT
Open the client as described in Step 3. Navigate to the runner tab, select which bots and maps to run, and hit Run Game! Finally, click the play/pause button to view the replay.
You can run games directly from the terminal with the gradle task \`./gradlew run -Pmaps=[map] -PteamA=[Team A] -PteamB=[Team B]\`. If you don't include the map or team flags, Battlecode will default to whatever is listed in \`gradle.properties\`. Running the same gradle task from your IDE will also work.

## Resources
Once you're all set up, make sure to check out the [resources](/bc24/resources/) page!


## Join the Community
Battlecode has a Discord server! Everyone is encouraged to join. Announcements, strategy discussions, bug fixes and ~memes~ all happen on Discord. Follow this invite link to join: [https://discord.gg/N86mxkH](https://discord.gg/N86mxkH).

`;

export const BC24_RESOURCES = `
### Game Specifications

[Specifications for Battlecode 2024!](https://releases.battlecode.org/specs/battlecode24/3.0.5/specs.md.html)

[Javadocs for Battlecode 2024!](https://releases.battlecode.org/javadoc/battlecode24/3.0.5/index.html)

### Coding Resources

If you're just starting out, check out the [getting started](/bc24/getting-started) page!

For more helpful resources while coding, see:

- [Common Issues](/bc24/common-issues)
- [Debugging Tips](/bc24/debugging-tips)

### Third-party Tools

The tools below were made by contestants! They haven't been tested by the devs, but might prove to be very helpful in developing your bot.

If you make a new tool that could be useful to others, please post it in the [#open-source channel](https://discord.gg/N86mxkH) on the Discord. Everyone will love you!!

- There is nothing here yet...

### Lectures

Battlecode 2024 will be holding lectures, where a dev will be going over possible strategy, coding up an example player, answering questions, etc. Lectures are streamed on Twitch. More details coming soon!

All lectures are streamed live on [our Twitch account](https://twitch.tv/mitbattlecode), and are later uploaded to [our YouTube channel](https://youtube.com/channel/UCOrfTSnyimIXfYzI8j_-CTQ).

`;

export const BC24_TOURNAMENTS: Record<TourneyPageKey, string> = {
  schedule: `# Battlecode 2024 Tournament Schedule
  Battlecode 2024 will have several tournaments throughout the month! We stream and commentate all tournaments online.

  The deadline to submit code for each non-final tournament is usually 7 pm EST *the day before* the tournament.

  `,
  prizes: `# Prizes

  Prize amounts are approximate and will be finalized soon!

  - **Final Tournament prizes:** Prizes will range from $5000 for 1st place to $500 for 16th place.
  - **Sprint prizes:** Winner of each tournament will receive $250.
  - **Newbie, High School prizes:** Prizes will range from $600 to $200 for the top 3 teams.
  
  If you are an international participant, please note that [US export regulations](https://www.bis.doc.gov/index.php/policy-guidance/country-guidance/sanctioned-destinations) may restrict our ability to award prizes to students from certain countries.
  
  `,
  format: `# Tournament Format

  Each match within a tournament will consist of at least 3 games, each on a different map, and the team that wins the most games will advance.

  Scrimmage rankings will be used to determine seeds for all tournaments. Ties will be broken by Sprint tournament rankings.

  Tournaments will be in a double elimination format, with the exception of both Sprint Tournaments, which are single elimination. The Final Tournament will start with a blank slate (any losses from the Qualifying Tournament are reset).

  Even if you miss earlier tournaments, you can participate in later tournaments (except the Final Tournament). This includes the Qualifying Tournament — you can participate even if you miss every other tournament (your seed will be determined by your scrimmage rank).
  `,
  rules: `# Eligibility Rules
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
};

/*
### Battlecode 2024 Tournament Schedule


### Prizes

### Tournament Format

### Eligibility Rules

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

*/
