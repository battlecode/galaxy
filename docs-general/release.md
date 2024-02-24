# How to release

## Creating a new episode

Create a new episode in the admin dashboard.

- Choose the eligibility criteria for the new episode. Competitors are able to select the criteria they fit through their team page.
- Fill in the scaffold url (the github link to our scaffold, e.g. https://github.com/battlecode/battlecode24-scaffold)
- Fill in the artifact name (as defined in `build.gradle` in the client/engine repository)
- Release version public/saturn can be empty for now. When a new version of the game is released, enter them here.

## Releasing client / engine (in battlecodeXX repo)

Before release:

- In `build.gradle`, update the artifactId to the current episode.
  Test release before lecture 1:
- Set IS_PUBLIC=NO in `release.yml`.
- Create the release in the engine/client repo. It should automatically release.

##
