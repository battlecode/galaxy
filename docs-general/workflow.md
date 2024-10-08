# Development Workflow

**(Disclaimer: This was written according to Nathan's philosophy. Everyone might differ! Follow what your team lead suggests.)** Feel free to adjust as you see fit, especially given the ebbs and flows of workload and resources.

**_TLDR: students are hosed, and webinfra work can be difficult, hard to learn, or boring, especially over IAP. Do whatever you can to make this more manageable! For example, work over the year so you don't have to put out fires during IAP, and carefully prioritize work to do more important stuff first so you don't get burnt out when it comes time to do important things._**

## High-level Goals

The highest, most fundamental goal behind Battlecode's webinfra development: **A competition should be easy to administer.**

This is a consequence of how Battlecode runs as a competition and as a team. In short, Battlecode development can be understaffed yet still need spiky labor, a dangerous combination that's important to mitigate.

As a competition, user activity occurs mostly during January, and within that, mostly during specific moments or days in January. Similarly, the website's contents need to be changed during specific moments in January, such as when the game is released or tournaments occur. All of this requires large efforts from devs during small amounts of times. So, it's important to mitigate this, by reducing the amount of steps needed to run a competition and by making each of these steps easier and smaller.

Furthermore, the Battlecode webinfra team tends to have more trouble getting hands. Devs, new and veteran, tend to be more excited by the prospect of doing engine or client work, since that's the core product of Battlecode. This makes it even harder to gather time and effort to work on webinfra. (Also, webdev is a more specialized coding framework and skill, that beginners don't tend to have, as opposed to the generic coding knowledge that engine or client may require.)

Compounding this, the webinfra team must allot their efforts to frontend, backend, infra, deploy / release engineering, and much more.

### Deadlines, planning, etc

For information on webinfra's deadlines throughout the years, and tips and tricks for hitting those deadlines, see here: https://docs.google.com/document/d/16bxwyXN5ZFv4aPFMoNAWLVbaKS2S1D_Chk2lK9RvFJc/edit

## Coding Principles

Write **well-written code**. In particular, prefer code that's **ETU**, SFB, and RFC (thanks 6.031!). Especially here, _simplicity is good_, especially given lack of working resources.

From that, modularity is also good, since this makes code much more easy to reason with and understand. This modularity can be found in many pairs of components: between back and frontend, _and between each part of frontend (e.g. between api and other things_), and finally within the same component too.

Another practice that keep things simple is only deriving/manipulating each piece of data in one place, and then passing it down as-is in other places, as much as possible. This especially helps you reason with data being communicated back and forth.

(While code that is performant or cool has its merits, such merits aren't as valuable in the fast-moving development of Battlecode.)

## Things To Do

### Organizing

Todos are tracked in two different places: on our internal Roadmap, and on GitHub's Issues list.

#### Roadmap

This is our more short-term solution, which is a Google Sheet that contains a list. These todos are usually short-term ones, for parts of the codebase that are not complete and actively in development. The roadmap also tracks who's doing the todo, how long it might take, links to relevant GitHub issues and PRs, etc.

After building out those parts, we tend to either put those todos both on the roadmap and on the issues list, or just only on the issues list (and not the roadmap at all).

You can find it here: https://docs.google.com/spreadsheets/d/172-JYNYRjMLcSE4diH5JcxV9_2i2Q9-YzzRpktx__WE/edit#gid=1866108322

#### Issues

We tend to use GitHub's issues during times of normal development. In particular, when a todo is more concrete and less obviously immediate, we turn it into an issue on GitHub. This list is used more as a backlog, and when development of all-new things slows, we tend to use this more.

We try to assign each issue a priority, between `critical`, `medium`, and `low`. (The exact meaning of each priority has changed, as the team features different members with different work styles, and as we find a system that works the best for all of us. A rule of thumb is that if `critical` issues are not fixed before the Battlecode season, then the competition will not fully run smoothly or as promised to competitors.)

Each issue also can belong to one or more modules (e.g. `backend`, `frontend`), and can have one or more types (e.g. `bug`, `refactor`). These, as well as priority, are assigned to issues via GitHub's labels. This allows for quick visualization and easy filtering.

(The counterexample to this is when Dependabot makes its own PRs and issues, and gives them its own labels. In the future, we might customize these labels to better fit our needs. See https://github.com/battlecode/galaxy/issues/676 for tracking.)

We occasionally categorize issues via GitHub's Milestones. A milestone is a collection of issues and PRs; each item can only belong to at most one milestone. Milestones are great for coordinating large projects with deadlines, such as launch date or tournaments. (Note that because each issue can only be assigned to one milestone, you must be careful to make milestones functionally distinct enough.)

<!-- We used to use Projects. If we ever use them again, feel free to revive these words -->
<!-- To track and organize progress on the issues, we use GitHub's Projects. These sort todos (issues or custom ones) into distinct columns, with customization availability. For example, see here for the frontend project: https://github.com/battlecode/galaxy/projects/2. The left column lists the high-level goals and milestones, in order to make sure we're always aware of the big picture. Then, issues and PRs are sorted into high, medium, or low priority. -->

### Creating

When any task makes itself known (by your testing, other reports, code flaws, or however else):

- Record this task somewhere!

  - If the todo is fitting for the roadmap, especially if it is to be actively worked on soon, then add it to the roadmap.
  - If you use a GitHub Issue, then (if you can) give it the corresponding labels.
  - (If you're having trouble deciding, then put it at least _somewhere_, or even in both. Ask the team for opinions too.)

- Please do **not leave "TODO" in completed code. Instead, create an issue, and leave a comment referencing that issue**. It's easy to write TODOs in the code and then forget about them or never see them. A GitHub issue provides more visibility, and more safety and convenience in tracking.
  (This practice also then lets you succinctly use "TODO" in your code as "within this PR".)

### Selecting

Now, say you're trying to do some work, and you look at the Roadmap or Issues list to pick a task to do. Before you begin a task, make a decision on whether you want to -- or should -- do this task.

For any task, **consider the benefits of doing it**. You can think of benefits from the "negative" viewpoint too. For example, you could consider the negatives of _not_ doing it, such as the impact of security holes and breaking bugs, or the dev time inevitably lost. (Automation and refactors can be subtle, since they have little tangible impact to competitors, but they do have high benefits (and high opportunity costs!) for devs.)

**On the other hand, consider the costs.** Remember that **your product takes effort, both to create and then to maintain.** Even if this task is easy to do in the short run, someone (perhaps not you) will have to be in charge of maintaining the finished product in the long run.

### Coding

Develop new features on branches. This is, in fact, almost mandatory -- the `main` branch is protected and pushes to `main` will be rejected.

In places where it makes sense, it could be good to write automatic test cases, although a lot of the functionality might not be very testable.

### Review

When your code is ready, create a pull request (PR), and then request code review. All PRs require at least one person's approval to be merged to `main`.

(If not ready but you would still like a PR, then you can create a draft PR. Press the corresponding button on GitHub.)

Once you have a PR, then on every push, GitHub will take the latest commit and run all checks and test cases.
It's not required to make sure every commit on GitHub passes, but anything merged to `main` is required (by GitHub) pass. GitHub will send you an automatic email if the checks fail.

## Doing Things: Working / Workstyle Preferences

A rule of thumb: **If you're not making forward progress for a while, ask for help, or consider trying a different direction or just not achieving the thing**. While there is benefit in self-discovery, the benefits of productivity are generally worth it, especially with the limited time and unlimited backlog of student life. Also, not every features is required or mandated to do.

Don't merge terrible-quality work -- the long-term cost of maintaining that makes it generally not worth it. Mandatory PR review ought to help this.
