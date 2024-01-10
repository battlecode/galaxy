# Galaxy

![CI](https://github.com/battlecode/galaxy/actions/workflows/ci.yml/badge.svg)

Galaxy is the framework that powers the infrastructure for MIT Battlecode.
The galaxy consists of three main parts:

- Siarnaq, the competitor dashboard that interfaces with our data storage. (Siarnaq, in turn, has two parts: a frontend and a backend.)
- Saturn, the compute cluster that compiles competitor bots and runs matches.
- Titan, the malware scanner that scans all file uploads.

## Development environment installation

Please follow these steps carefully to ensure your development environment is initialized correctly.

1. Clone this repository at [battlecode/galaxy](https://github.com/battlecode/galaxy).
1. Install [Conda](https://docs.conda.io/en/latest/miniconda.html), our package-manager and build-system.
   Prepare your environment using `conda env create -n galaxy -f environment-dev.yml` and `conda activate galaxy`.
1. We use [Pre-commit](https://pre-commit.com/) to sanity-check the codebase before committing.
   It will be automatically installed by Conda.
   Your local git will reject commits that fail these sanity-checks.
   Initialize Pre-commit using `pre-commit install`.

If the Conda specifications are updated upstream, you can refresh your local environment to match it by running `conda env update -n galaxy -f environment-dev.yml`.

Afterwards, to run systems locally, see each of their respective directory's readme files.

## Development workflow

See [docs-general/workflow.md](docs-general/workflow.md) for workflow information. **Reading this page, especially the "Coding" and "Review" sections, before starting work is highly recommended.**

For specific development workflows in each module, see the README files in the respective folder.

Develop new features on branches and use pull-requests to request code-review.
The `main` branch is protected and pushes to `main` will be rejected.

We will be using the [Projects](https://github.com/battlecode/galaxy/projects?type=classic) feature to track our todo list.
Entries in the "To do" column are allowed to simply be items created in the project board, but once the entry moves to one of the other columns (e.g. "In progress"), please convert the entry into an issue for easier discussion and reference in PRs.

To start a feature, _claim_ it on the Projects page by moving it to the "In Progress" column and adding your name to it. Then you can work on it on a git branch.

In places where it makes sense, it could be good to write test cases, although a lot of the functionality might not be very testable.

GitHub has been configured to automatically verify all Pre-commit checks and in the future will also run all test cases.
It's not required to make sure every commit on GitHub passes, but anything merged to main should pass. GitHub will send you an email if the checks fail.

## How to release a new episode

Create a new episode in the admin dashboard.

Choose the eligibility criteria for the new episode. Competitors will be able to select which criteria they fit in their team page.

Fill in the scaffold URL, artifact name, and the release versions.

Game release is when the specs/javadocs will be publically available. This should be during the first lecture.

### Testing

TODO: fill out more
give battlecodedownloadpackage access to private battlecod escaffods if you want to test before making them public

### Publishing maps

Maps must be published through the admin dashboard before competitors can scrimmage with them. Add maps here: https://api.battlecode.org/admin/episodes/map/add/

### Release

During the first lecture, create a new release with IS_PUBLIC set to YES in release.yml

### Creating Tournaments

Only the sprint tournaments are single elimination, and all other tournaments are double elimination.

Submission freezes are usually at 7pm the day before the displayed tournament date. Set the submission unfreeze to be after the tournament is streamed live.

**All tournament submission freezes should be 30 seconds after the hour, for two reasons:**

- Competitor clocks might be out of sync, so we give them a couple seconds of grace.
- We want last-second autoscrims to run… and they spawn a few seconds past the hour. Since autoscrims don’t run past the deadline, we want to make sure they have enough time to spawn.

Remember to check the box `Require resume` for all non-sprint tournaments.

Leave `External id private/public` empty. These will be automatically filled in upon initializing the tournament.

    There is a user whose username is “admin”. Log into it and create a new team called “Reference Player” (ideally, before that team name gets stolen :stuck_out_tongue:)
    “admin” will be the only member of Reference Player
    on api.battlecode.org/admin, set the team type to Invisible. you don’t want anyone to try to scrim against it yet

I forgot “admin”’s password but you can reset it at api.battlecode.org/admin. The password should be “good” because the account has at least as many permissions as yours, if not more.NB!

    Teams with no members will get deactivated.
    Your personal account should stay on Teh Dev team.
    This is why “admin” exists: so that Reference Player can exist without needing you to stay on it.

when reference player is ready:

    submit the bot to Reference Player
    NB! Teh Dev team will always run examplefuncsplayer, and never change
    change “Reference Player” to Staff instead of Invisible
    add a class requirement to https://api.battlecode.org/admin/teams/classrequirement/ to help you automatically calculate who passed

NB! important to be “Staff” and not a regular team. Results of scrims against Staff teams are redacted in the Queue to protect students from having their grades exposed (edited)
