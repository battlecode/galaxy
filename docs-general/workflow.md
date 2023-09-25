# Development Workflow

## High-level Goals

The guiding principle behind Battlecode's frontend development: **A competition should be easy to administer, and the code should be easy to understand and work with.**

To this end are several more-specific objectives, that also guide development. See here: https://github.com/battlecode/galaxy/milestones

This is a consequence of how Battlecode runs as a competition and as a team. In short, Battlecode frontend development can be understaffed yet still need spiky labor, a dangerous combination that's important to mitigate.

As a competition, user activity occurs mostly during January, and within that, mostly during specific moments or days in January. Similarly, the website's contents need to be changed during specific moments in January, such as when the game is released or tournaments occur. All of this requires large efforts from devs during small amounts of times. So, it's important to mitigate this, by reducing the amount of steps needed to run a competition and by making each of these steps easier.

As a team, Battlecode has a few quirks. First, the team -- especially the webinfra team -- is small, and devs collectively have little time and bandwidth. Compounding this, the webinfra team must allot their efforts to frontend, backend, infra, deploy engineering, and much more. Finally, frontend work can simply be unexciting. Devs, new and veteran, tend to be more excited by the prospect of doing engine or client work, since that's the core product of Battlecode. This makes it even harder to gather time and effort to work on webinfra.

## To-do Organizing

Todos are tracked first and foremost on GitHub's Issues list. Any frontend-relevant issues should have their title include "[frontend]". Issues are either labeled with `enhancement` or `critical`. The `critical` label is for todos that will seriously impact Battlecode, for example by creating dangerous bugs, or creating work that piles on later for devs. The `enhancement` is for less-impactful todos. (A rule of thumb is that even if `enhancement` todos are not done, Battlecode will still run smoothly and will not need overly-skilled/hyperspecialized devs. This does not apply to `critical` todos of course.)

Further, these issues can also be categorized via GitHub's Milestones. There are various milestones relating to the frontend work, and issues that cleanly match a milestone are assigned to that milestone. You can see the list of milestones from the issues list.

To track and organize progress on the issues, we use GitHub's Projects. See here for the frontend project: https://github.com/battlecode/galaxy/projects/2. The left column lists the high-level goals and milestones, in order to make sure we're always aware of the big picture. Then, issues and PRs are sorted into high, medium, or low priority.

## To-do Creation

When _any_ frontend-related task makes itself known (eg by your testing, other reports, code flaws, etc):

- Create an issue. Make sure its title includes "[frontend]". Label it with "enhancement" or "critical"; see the "To-do organizing" section and use your judgement to classify this. Finally, if applicable, add it to a relevant milestone.

- Please do **not write "TODO" in code. Instead, create an issue, and leave a comment referencing that issue**. It's easy to write TODOs in the code and then forget about them or never see them. The Issue list is a much safer place to track them.

- If it needs to be be actively in the team's conscience, then add it to the project board.

## Work Decisions

Now, say you're trying to do some work, and you look at the Issues list to pick a task to do.

**Before you begin a task, make a decision on whether you want to -- or should -- do this task.**

For any task, **think about the benefits of doing it**. It's especially helpful to think of how much dev time is lost to not doing it: how much extra hoops devs jump through to do simple tasks, how much time devs spend instructing users to carry out workarounds, etc. Of course, _security holes and breaking bugs_ have extreme benefit, since the cost of not doing them -- that is, having breaking bugs and security holes -- is as high as it could be.

Sometimes tasks may not be highly beneficial. For instance, you could be making a change to a one-line piece of code that devs would not be stumbling on anyways, or simplifying a workflow that occurs once-a-year during dead time.

**On the other hand, judge the costs.** Remember that **your product takes effort, both to create and then to maintain.** Even if this task is easy to do in the short run, someone (perhaps not you) will have to be in charge of using your product and maintaining it in the long run. The frontend team's lack of time makes this especially problematic.

So, **consider being light on features and new code.** This is an all-new creation of code, and yet another distinct piece of technology that someone on the team will have to wrap their head around. This person will have to learn from scratch (rather than simply replacing/updating knowledge).

**Deciding whether to do other tasks, such as automation and refactors, involves more nuance.** Sometimes, the cost of _not_ doing this task is high. For example, the cost of not having automation for a frequent or time-sensitive operation can be high, because the manual process would require high effort. And frontend devs already are strained with effort! Another example is refactoring code that is likely to be touched again later: trying to add a feature to already-bad code becomes extremely hard, so that's a high long-term cost.

## Working / Workstyle Preferences

A rule of thumb: **If you're not making forward progress for 10 minutes, ask for help**. This _includes making progress but nothing that's clearly in the direction of your solution_. While there is benefit in self-discovery, it might not be worth that extra time, effort, and potential frustration. Instead, the benefits of productivity are generally worth it. This especially holds for the frontend dev team and limited time. (Plus, asking for help is a useful skill, and the _habit_ to ask for help is useful too!)

Similarly, **if you can't solve a problem after 20 minutes, think about trying a different solution or just not solving it**. While clean code and clean solutions are good, it's perhaps not worth the effort, especially with how much work among Battlecode/frontend there is to do and how little time Battlecode devs have. Perhaps the problem could take a different approach. Or perhaps you don't even need to solve _this specific problem: zoom one level out, and try something different there that avoids this problem altogether_.

_An important caveat:_ Don't merge terrible-quality work, of course. The effort needed to learn and maintain that is tough. So, if you write hacky or unelegant solutions, at least make sure others can follow your code along. PR review ought to help this.

Feel free to adjust those minute values as you see fit, especially given the ebbs and flows of team workload and team size/bandwidth/resources/time. The general practices still hold and would still be useful.

## Engineering Principles

Write **well-written code**. In particular, prefer code that's **ETU**, SFB, and RFC (thanks 6.031!). Especially here, _simplicity is good_, especially given lack of working resources.

From that, modularity is also good, since this makes code much more easy to reason with and understand. This modularity can be found in many pairs of components: between back and frontend, _and between each part of frontend (e.g. between api and other things_), and finally within the same component too.

Another practice that keep things simple is only deriving/manipulating each piece of data in one place, and then passing it down as-is in other places, as much as possible. This especially helps you reason with data being communicated back and forth.

(While code that is performant or cool has its merits, such merits aren't as valuable in the fast-moving development of Battlecode)
