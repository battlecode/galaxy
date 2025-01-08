import type {
  QuickStartPageKey,
  ResourcesPageKey,
  DebuggingTipsPageKey,
  CommonIssuesPageKey,
  TourneyPageKey,
} from "./ContentStruct";

export const QUICKSTART: Partial<Record<QuickStartPageKey, string>> = {
  Overview: `
This is the Battlecode 2025 Java contest website, which will be your main hub for all Battlecode-related things for the duration of the contest. For a general overview of what Battlecode is, visit [our landing page](https://battlecode.org/).

*The bread and food of yore has begun to run out, forcing robot society to adapt. Gone are the jovial ducks, replaced by steampunk robot bunnies who have converted their need for nutrients into a reliance on paint. These bunnies have become territorial, forming clans and defense formations to protect the resource that keeps them running.*

*For the past two centuries, these bunnies have stayed within their own territory, but clans have begun to degrade their environment and need to start branching out. Will these clans be able to expand their territory and generate enough paint to protect their families? Or will they stray too close to other clans and be wiped out in conflict?*
`,
  "Account and Team Creation": `
To participate in Battlecode, you need an account and a team. Each team can consist of 1 to 4 people.

[Create an account](/register) on this website, and then go to the [team section](/bc25java/my_team) to either create or join a team.

If you need to rename your team for any reason, please reach out to Teh Devs on [Discord](https://discord.gg/N86mxkH) or at [battlecode@mit.edu](mailto:battlecode@mit.edu).
`,

  "Installation and Setup": `

Check [common issues](/bc25java/common_issues/) if you experience problems with the instructions below, and if that doesn't help, ask on the Discord.

### Step 1: Install Java

You'll need a Java Development Kit (JDK) version 21. Other versions will not work, and note that this is different from the previous episodes' use of Java 8. [Download it here](https://www.oracle.com/java/technologies/downloads/#java21). You may need to create an Oracle account, or you can use another JDK distribution.

- Alternatively, you can install a JDK yourself using your favorite package manager. Make sure it is compatible with Java 21.

If you're unsure how to install the JDK, you can find instructions for all operating systems [here](https://docs.oracle.com/en/java/javase/21/install/overview-jdk-installation.html) (pay attention to \`PATH\` and \`CLASSPATH\`).

### Step 2: Download Battlecode

Next, you should download the [Battlecode 2025 scaffold](https://github.com/battlecode/battlecode25-scaffold). To get up and running quickly, you can click "Clone or download" and then "Download ZIP," and move on to the next step.

We recommend, however, that you instead use Git to organize your code. If you haven't used Git before, read [this guide](https://docs.github.com/en/get-started/using-git/about-git) (or wait for our lecture covering it). On the [scaffold page](https://github.com/battlecode/battlecode25-scaffold), click "Use this template." Importantly, on the next page, make your new repo private (you don't want other teams to view your code!). You can then clone your newly created repo and invite your team members to collaborate on it.

### Step 3: Local Setup
We recommend using an IDE like IntelliJ IDEA or Eclipse to work on Battlecode, but you can also use your favorite text editor combined with a terminal. Battlecode 2025 uses Gradle to run tasks like \`run\`, \`debug\` and \`jarForUpload\` (but don't worry about that — you don't need to install it).

#### IntelliJ IDEA
- Install IntelliJ IDEA Community Edition [from here](https://www.jetbrains.com/idea/download/).
- In the \`Welcome to IntelliJ IDEA\` window that pops up when you start IntelliJ, select \`Import Project\`
- In the \`Select File or Dictionary to Import\` window, select the \`build.gradle\` file in the scaffold folder.
- Hit OK.
- We need to set the jdk properly; open the settings with \`File > Settings\` (\`IntelliJ IDEA > Preferences\` on Mac) or \`ctrl+alt+s\`. Navigate to \`Build, Execution, Deployment > Build Tools > Gradle\` and change \`Gradle JVM\` to 21.
- Time for a first build! On the right side of the screen, click the small button that says gradle and has a picture of an elephant. Navigate to \`battlecode25-scaffold > Tasks > battlecode\` and double click on \`update\` and then \`build\`. This will run tests to verify that everything is working correctly, as well as download the client and other resources.
- If you haven't seen any errors, you should be good to go.

#### Eclipse
- Download the latest version of Eclipse [from here](https://www.eclipse.org/downloads/).
- In the Installer, select \`Eclipse IDE for Java Developers\`.
- Create a new Eclipse workspace. The workspace should NOT contain the \`battlecode25-scaffold\` folder.
- Run \`File -> Import...\`, and select \`Gradle / Existing Gradle Project\`.
- Next to \`Project root directory\` field, press \`Browse...\` and navigate to \`battlecode25-scaffold\`. Finish importing the project.
- If you do not see a window labeled \`Gradle Tasks\`, navigate to \`Window / Show View / Other...\`. Select \`Gradle / Gradle Tasks\`.
- In the \`Gradle Tasks\` window, you should now see a list of available Gradle tasks. Open the \`battlecode25-scaffold\` folder and navigate to the\`battlecode\` group, and then double-click \`update\` and \`build\`. This will run tests to verify that everything is working correctly, as well as download the client and other resources.
- You're good to go; you can run other Gradle tasks using the other options in the \`Gradle Tasks\` menu. Note that you shouldn't need any task not in the \`battlecode\` group.


#### Terminal
- Start every Gradle command with \`./gradlew\`, if using Mac or Linux, or \`gradlew\`, if using Windows.
- You will need to set the \`JAVA_HOME\` environment variable to point to the installation path of your JDK.
- Navigate to the root directory of your \`battlecode25-scaffold\`, and run \`./gradlew update\` and then \`./gradlew build\` (or \`gradlew build\` on Windows). This will run tests to verify that everything is working correctly, as well as download the client and other resources.
- You're good to go. Run \`./gradlew -q tasks\` (\`gradlew -q tasks\` on Windows) to see the other Gradle tasks available. You shouldn't need to use any tasks outside of the \`battlecode\` group.


There should now be a folder called \`client\` in your scaffold folder; if you go in there, and double click the \`Battlecode Client\` application, you should be able to run and watch matches. (Please don't move that application, it will be sad.) If you notice any severe issues with the default client, you can try setting the \`compatibilityClient\` gradle property to true to download the compatibility version.

### Developing Your Bot
Place each version of your robot in a new subfolder in the \`src\` folder. Make sure every version has a \`RobotPlayer.java\`.
Check [debugging tips](/bc25java/debugging_tips) if you experience problems while developing, or ask on the Discord.

### RUNNING BATTLECODE FROM THE CLIENT
Open the client as described in Step 3. Navigate to the runner tab, select which bots and maps to run, and hit Run Game! Finally, click the play/pause button to view the replay.
You can run games directly from the terminal with the gradle task \`./gradlew run -Pmaps=[map] -PteamA=[Team A] -PteamB=[Team B]\`. If you don't include the map or team flags, Battlecode will default to whatever is listed in \`gradle.properties\`. Running the same gradle task from your IDE will also work.

Note that you can also use the web client located at [https://play.battlecode.org/bc25java/client](/bc25java/client) if you are having issues running the client locally.
`,
};

export const RESOURCES: Partial<Record<ResourcesPageKey, string>> = {
  "Coding Resources": `

If you're just starting out, check out the [quick start](/bc25java/quickstart) page!

For more helpful resources while coding, see:

- [Common Issues](/bc25java/common_issues)
- [Debugging Tips](/bc25java/debugging_tips)

`,
  "Third-party Tools": `

The tools below were made by contestants! They haven't been tested by the devs, but might prove to be very helpful in developing your bot.

If you make a new tool that could be useful to others, please post it in the [#open-source channel](https://discord.gg/N86mxkH) on the Discord. Everyone will love you!!

- There is nothing here yet...

`,
  Lectures: `

Battlecode 2025 Java will be holding lectures, where a dev will be going over possible strategy, coding up an example player, answering questions, etc. You do not have to be an MIT student to view our lectures, and they are open to everyone! The lectures are beginner-friendly and are stongly recommended for both newcomers and past participants.

All lectures are streamed live on and later uploaded to [our YouTube page](https://www.youtube.com/@MITBattlecode).
`,
};

export const DEBUGGINGTIPS: Partial<Record<DebuggingTipsPageKey, string>> = {
  Debugging: `

Using a “debugger” lets you pause your code while its running and inspect its state - what your variables are set to, what methods you're calling, and so on. You can walk through your code step-by-step, and run arbitrary commands.

Battlecode supports “remote debugging”, which means that you start up the battlecode server and tell it to pause, then connect to it with Eclipse or Intellij. It's easy to set up.

Following this guide, you'll be able to view the game in the client as you are debugging. Just keep the client open and the game should automatically play (up until your breakpoint).

### Debugging vocabulary

Debugging has some new words that you might not know:

A **debugger** is a tool that runs your code and pauses when you tell it to. You'll be using Eclipse or Intellij as a debugger for battlecode (unless you're particularly hardcore.)

A **breakpoint** is an automatic pause point in the code. When the debugger gets to that line of code, it will pause, and wait for you to tell it what to do.

**Stepping** is telling the debugger to take a single “step” in the code, and then pause again.

You can also **resume** code, to keep running until you hit another breakpoint.

The **stack** and **stack frames** are fancy words for, basically, the list of methods that are currently being called. So, if you have the methods:

\` void doSomething() {goSomewhere();}void goSomewhere() {goLeft();}void goLeft() {rc.move(LEFT);}\`

And you call \`doSomething()\`, the stack will look like:

\`  ... ^ rc.move(LEFT) ^ goLeft() ^ goSomewhere() ^ doSomething() \`

If you have questions, ask in IRC.

### Starting the server in debug mode

Do \`./gradlew runDebug -PteamA=examplefuncsplayer -PteamB=examplefuncsplayer -Pmaps=FourLakeLand\` in a terminal. (Or equivalent, for the teams and maps you want.) (This works exactly like \`./gradlew run\`.) If you're in IntelliJ, you can just run the \`runDebug\` Gradle task there.

It should say \`Listening for transport dt_socket at address: 5005\` and pause.

This means that the server has started, and is waiting for the Eclipse or IntelliJ debugger to connect.

(You have to do this every time you want to debug.)
`,
  "Debugging in IntelliJ": `

#### Initial setup

- Go into IntelliJ
- Set a breakpoint by clicking on the area beside the line numbers to the left of your code.
- Right click the breakpoint and select \`Suspend / Thread\`, and then click “Make default.” (This lets battlecode keep working while your code is paused.)
- Go to Run > Edit Configurations…
- Hit the “+” icon and select “Remote”
  - Give it a name like “Debug Battlecode”
  - In “Settings”:
    - Set Host to \`localhost\`
    - Set Port to \`5005\`
  - Hit OK
- In the top right corner of the screen, you should be able to select “Debug Battlecode” or equivalent from the little dropdown, and then hit the bug icon
- If it works:
  - IntelliJ should highlight the line you put a breakpoint on and pause. You should see a “Debug” window at the bottom of the screen. Congratulations! You're debugging.
- If it doesn't work:
  - If the match just runs and nothing happens, then make sure that your breakpoint is in a place that will actually run during the match (e.g. at the top of \`RobotPlayer::run\`.)
  - If you get \`Unable to open debugger port (localhost:5005): java.net.ConnectException "Connection refused"\`, make sure you've actually started the server in \`runDebug\` mode, and that your port is set correctly. (You may also have to mess with your firewall settings, but try the other stuff first.)

#### Ignoring battlecode internals

Sometimes you can step into battlecode internal stuff by accident. To avoid that:
- Go into Settings or Preferences > Build, Execution, Deployment > Debugger > Stepping
- Select the “Skip class loaders” button
- Select all the “Do not step into the classes…” options
- Add the following packages by hitting the \`+\`
  - \`battlecode.*\`
  - \`net.sf.*\`
  - \`gnu.trove.*\`
  - \`org.objectweb.*\`

#### How to use the debugger

When the debugger is paused, you should be able to see a “Debug” window. It has the following stuff in it:

- The “Frames” tab, which shows all the methods that have been called to get to where we are. (You can ignore the methods below “run”; they're battlecode magic.)
- The “Variables” tab, which shows the values of variables that are currently available.
- A line of icons:
  - “Step over”, which goes to the next line in the current file, ignoring any methods you call.
  - “Step into”, which goes into whatever method you call next.
  - “Force step into”, which does the same thing as Step into, but also shows you inscrutable JVM internals while it goes. You shouldn't need this.
  - “Step out”, which leaves the current method.
  - “Drop Frame”, which pretends to rewind, but doesn't really. Don't use this unless you know what you're doing.
  - “Run to Cursor”, which runs until the code hits the line the cursor is on.
  - “Evaluate Expression”, which lets you put in any code you want and see what its value is.
- The “Threads” tab, which you shouldn't mess with, because you might break the server.

To learn more about these tools, see the [Intellij documentation](https://www.jetbrains.com/help/idea/2016.3/debugger-basics.html).

#### Conditional breakpoints

Sometimes, you might only want to pause if your robot is on team A, or the game is in round 537, or if you have fewer than a thousand bytecodes left. To make these changes, right click the breakpoint, and in the condition field, put the condition; you can use any variables in the surrounding code. If I have the method:
`,
  "Debugging in Eclipse": `

#### Initial setup

- Go into Eclipse
- Set a breakpoint in your code by clicking on the margin to the left of it so that a blue bubble appears
- Go to Run > Debug configurations
- Select “Remote Java Application”
- Hit the “new” button
- Set up the debug configuration:
  - Give it a name (i.e. Debug Battlecode Bot)
  - Hit Browse, and select your project
  - Make sure connection type is “Standard”
  - Set Host to \`localhost\`
  - Set Port to \`5005\`
  - If there's an error about selecting preferred launcher type at the bottom of the dialog, pick one; scala if you have scala code, java otherwise; although they should both work.
- Hit “Apply”
- Hit “Debug”
  - If it works:
    - Eclipse should ask to open the “Debug” view; let it.
    - You should see new and exciting windows, and eclipse should pause and highlight a line of your code.
    - Congratulations; you're debugging.
  - If it doesn't:
    - You may get a “failed to connect to VM; connection refused.” Make sure you've [started the server in debug mode](#starting-the-server-in-debug-mode).

You can also start debugging by selecting the little triangle next to the beetle in the toolbar and selecting “Debug Battlecode Bot”.

#### Ignoring battlecode internals

Oftentimes while debugging you can often step into classes you don't care about - battlecode internal classes, or java classes. To avoid this, right click a stack frame in the “Debug” window - i.e. the thing beneath a Thread labeled \`RobotPlayer.run\` or whatever - and:
- Select “Use Step Filters”
- Select “Edit Step Filters”.
- Select all the predefined ones
- Add filter…
  - \`battlecode.*\`
  - \`net.sf.*\`
  - \`gnu.trove.*\`
  - \`org.objectweb.*\`
- Hit “Ok”

And you should be good to go!

#### Using the debugger.

See the [eclipse documentation](http://help.eclipse.org/neon/index.jsp?topic=%2Forg.eclipse.jdt.doc.user%2Freference%2Fviews%2Fdebug%2Fref-debug_view.htm).

#### Conditional Breakpoints

Sometimes, you might only want to pause if your robot is on team A, or the game is in round 537, or if you have fewer than a thousand bytecodes left. To make these changes:
- Right click the breakpoint
- Go to “Breakpoint Properties”
- Check “Conditional”
- Write a condition in the text box

If I have the method:

\`\`\`java
import battlecode.common.Clock;
import battlecode.common.RobotController;
class RobotPlayer {
  // ...
  public static void sayHi(RobotController rc) {
    rc.broadcast(rc.getID(), rc.getType().ordinal());
  }
}
\`\`\`
I could make the following conditions: - \`rc.getTeam() == Team.A\` - \`rc.getRoundNum() == 537\` - \`Clock.getBytecodesLeft() < 1000\` - \`rc.getTeam() == Team.A && rc.getRoundNum() == 537 && Clock.getBytecodesLeft() < 1000\`
`,
  "Second Method: Debugging in IntelliJ": `

This method probably does not allow you to view the game in the client at the same time. We recommend following the instructions above.

Add the gradle run task as a configuration:
- In the dropdown near the hammer, play, and bug icons, select \`edit configurations\`
- Hit the plus and select \`gradle\`
- Give the configuration a name, e.g. "RunBattlecode"
- Next to the \`gradle project\` field, click the folder icon and select \`battlecode25-scaffold\`
- In the \`Tasks\` field, type \`run\`
- Click \`Apply\`, \`Ok\`

When your configuration is selected from the dropdown menu, clicking play will run the game, the same way double clicking run in the gradle window does. Clicking on the bug icon next to the play button will run the game in debug mode in the ide. Use breakpoints and the debuging interface to walk through your code. For more info on debugging with intelliJ, see [here](https://www.jetbrains.com/help/idea/debugging-code.html) You can specify the map and teams to run in the \`gradle.properties\` file.

`,
};

export const COMMONISSUES: Partial<Record<CommonIssuesPageKey, string>> = {
  "Installation Issues": `

Known errors, with solutions:

- \`Exception in thread "examplefuncsplayer.RobotPlayer #0" java.lang.IllegalArgumentException\`. This means that Gradle is not finding a Java 21 JDK. This could be if you installed an incompatible version of Java, or if you already had another version of Java installed from earlier. We will add instructions here shortly, but for now, ask on the Discord for the fix.
  - Before doing the following two suggestions, try adding the line \`org.gradle.java.home=<path to your java 21 jdk>\` to your \`gradle.properties\` file
  - For Windows, try following [these instructions](https://www.theserverside.com/feature/How-to-set-JAVA_HOME-in-Windows-and-echo-the-result).
  - Try setting \`org.gradle.java.home=/path_to_jdk_21_directory\`. You need to know your \`JAVA_HOME\` (try [this guide](https://www.baeldung.com/find-java-home)).
- \`Exception in thread "WebsocketSelector14" java.lang.NullPointerException\`. A common error in java, but sometimes happens if you close the client while a game is running. The solution is to run \`./gradlew --stop\` to stop all of the Gradle daemons and the next time you open the client it will use a fresh one.
- \`Exception in thread "WebsocketSelector14" java.lang.NullPointerException at battlecode.server.NetServer.onError(NetServer.java:165)\`. This probably means that you're running two instances of the engine at the same time. Try running \`./gradlew --stop\` (if you're running things in IntelliJ, click the elephant in the Gradle Tool Window (the right-hand sidebar) and then execute \`gradle --stop\` in the window that pops up). If that doesn't work, ask on the Discord.

If your error is not listed above, ask on [the Discord](https://discord.gg/N86mxkH).
`,
  "Client Issues": `

If you're experiencing memory problems with the client, please try:

 - Making .bc25 files with the engine directly and uploading them to the client's match queue, rather than using the client's runner. The web client can be found at [https://play.battlecode.org/bc25java/client](https://play.battlecode.org/bc25java/client) and can be used in place of the desktop application.
  `,
  "Other Issues": `
- *After an update, IntelliJ doesn't recognize new API functions (e.g. \`rc.getMapWidth\`).* You need to refresh dependencies. Right-click on the project name (most likely \`battlecode25-scaffold\`) in the Gradle Tool Window (the right-hand sidebar), and click \`Refresh Gradle Dependencies\`. It is good to do this after every update.
- You can enable auto-updates in IntelliJ by navigating to \`settings > build, execution, deployment > Gradle\` and checking \`Automatically import this project on changes in build script files\`, or the button that says something similar if you have an older version.
`,
  "Things to Try When Nothing Else Helps": `
#### Things to Try When Nothing Else Helps

(Note, Gradle tasks are written as \`./gradlew taskname\` here, but you can also run \`taskname\` in your IDE.)

Always follow each of the below Gradle commands with \`./gradlew build\`.

- Are you on the latest version of Battlecode? try \`./gradlew update\`
- Did you download the JDK 21 listed in [the installation instructions](/bc25/quickstart)?
- Did you set your \`JAVA_HOME\` correctly?
- \`./gradlew clean\` (always good to try)
- \`./gradlew cleanEclipse\` (if Eclipse)
- \`Refresh Gradle Dependencies\` in IntelliJ (see above)
- \`./gradlew --stop\` (stops Gradle daemons)
- \`rm -r ~/.gradle\` (removes the Gradle cache)
- Redownload **[the scaffold](https://github.com/battlecode/battlecode25-scaffold)**.

`,
};

export const TOURNAMENTS: Partial<Record<TourneyPageKey, string>> = {
  "Tournament Schedule": `
Battlecode 2025 Java will have several tournaments throughout the month! We stream and commentate all tournaments online.

The deadline to submit code for each non-final tournament is usually 7 pm EST *the day before* the tournament.

Please note that **all times on this page are in your current time zone**. Refer to the submission freeze countdown timer for the time remaining before the next submission freeze.
`,
  Prizes: `
Prize amounts are approximate and will be finalized soon!

- **Final Tournament prizes:** Prizes will range from $5000 for 1st place to $500 for 16th place.
- **Sprint prizes:** Winner of each tournament will receive $250.
- **Novice, High School prizes:** Prizes will range from $600 to $200 for the top 3 teams.

If you are an international participant, please note that [US export regulations](https://www.bis.doc.gov/index.php/policy-guidance/country-guidance/sanctioned-destinations) may restrict our ability to award prizes to students from certain countries.
    `,
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
- **MIT Novice Tournament:** Teams must **consist entirely of MIT students** who have never competed in Battlecode before.
- **High School Tournament:** Teams must **consist entirely of high school students**.
- **Final Tournament:** Teams must have qualified via the US or International Qualifier. The final match of the Newbie and High School tournaments will also be played at the final tournament.

Contact us on [Discord](https://discord.gg/N86mxkH) or at [battlecode@mit.edu](mailto:battlecode@mit.edu) if you are unsure of your eligibility.
    `,
};
