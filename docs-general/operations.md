# Operations

## Enabling a new episode

This is a outline (non-exhaustive) of necessary tasks when creating and releasing a new episode, such as releasing every new annual game.

Some of these tasks may fall outside the dominion of webinfra. If they looks like something that engine / client should do, then bug them to di it instead.

### Preparing before release

- Determine various info about the episode, especially prize and tournament info. (This should be done by the presidents, etc. You can also do this later.)
- Add episode to backend
  - This should be easy via the admin panel. You'll have to add various information there
- Add tournaments to backend
  - If exact tournaments and schedule is not known, estimates are fine. Or you can skip this step for now. Make sure you come back to it though!
  - **Tournament times / deadlines should be set to be slightly later than the nominal time. For example, if a tournament is nominally 7pm, set the submission freeze time to something like 7:00:30 or 7:01.**
    - This allows for leniency with differences in clocks.
    - Also, this enables an autoscrimmage round to run before the submission deadline, which can be helpful to converge seeds.
- Create the team of Teh Devs
- Have new devs create accounts.
- For _only to the people who need this_, make their accounts "admin" accounts. (Any other admin can do this from the admin panel with their IDs.) Please be cautious, safe, and secure!!
- Add episode in frontend
  - This is needed for frontend systems that keep an enumeration of the episodes (just as the backend does). If your frontend doesn't have a redundant list of episodes, then don't worry about this step.
- Update the default episode in frontend
- Update the competition info in the frontend. (Again, you can do this later, just don't forget.) In particular, update:
  - Prizes
  - Sponsors
  - Tournament info
- Release a new version of the frontend.
- Release a new _private_ (at first) version of the engine and client when ready. In particular, **set IS_PUBLIC=NO in release.yml, and have the release number be below 1.0.0**
  - Instructions for this should be in the respective readme. (You can ask their teams to do it -- in fact, this is arguably better, for shared knowledge.)
- **Give, to the battlecodedownloadpackage "account", access to the scaffold.**
- Now there are quite a few important things to test...
- **Test that a game can be played on the website!** Create a couple teams, submit some bots, queue up a match, etc.
- Also, **test that both clients -- web-based and native -- work!** Grab the replay from that match and load it in.
  - (The native client, especially its deploy, are sort of )

<!-- TODO scour through the past couple weeks of slack, in each channel -->

### The release!

- **At the start of the first IAP lecture (roughly 7pm sharp), release a new _public_ version of the game!**
  - Ensure that the release info in `release.yml` in the engine/client repository has `IS_PUBLIC: YES`.
  - Also, have this version be v1.0.0 .
  - You can ask the engine/client teams to do this, like with the prerelease testing versions.
- Add the maps we'll be releasing: https://api.battlecode.org/admin/episodes/map/add/
- Fill in the autoscrim schedule: https://api.battlecode.org/admin/episodes/episode/{episodeId}/change/

### Before final tournament

- **Remove any devs from regular teams!!!!** If a dev is on a regular team (and hasn't submitted a resume), the dev could invalidate the team from being eligible for prizes.

- Set up custom eligibility criterion for the final tournaments

  - To pull only a specific set of teams (ie the finalists)
  - NB: Finalists will not be seeded in order of finish during quals, but instead, using current rankings (including any laddering after quals). This is probably fine. But if people object, consider working around this

- Prepare for students getting grades!
  - Set up ReferencePlayer
    - Create the team
    - Put the `referenceplayer` user on that team
    - Upload the bot
  - Select maps for students to use while challenging `referenceplayer`
  - **Input this into a ClassRequirement on the database**
  - Announce to students that ReferencePlayer is ready, along with some instructions, including:
    - **the scrimmage request must be an unranked scrimmage request**
    - **the maps of the scrimmage must exactly match the maps on the ClassRequirement**
      - Users don't have access to view the ClassRequirement, so you should spell out the users here
    - And perhaps other stuff that I can't think of rn. Check with the presidents!
  - Monitor that people are passing the class
    - Use this endpoint to get results: `https://api.battlecode.org/api/team/{episode}/requirement/{requirementId}/compute/`
  - Get final grades (whenever deemed fit) using that same endpoint

## Get dev permissions

TODO, tracked in #681

Then, a dev with admin permissions can go to https://api.battlecode.org/admin to do a bunch of cool things.

## Add a dev to any team

TODO, tracked in #681

This enables lots of cool technical support things. Most notably, **this is the (currently) "unofficial-official" way to view and download a team's submissions and replays**, which is helpful in debugging.

## Monitoring

Occasionally things might break. Then, Discord might light on fire, and Discord notifications/pings might light on fire.

Other symptoms include:

- Many failed submission compilations or match runs
- In a Pub/Sub, lots of un-acknowledged messages

## Debugging

Issues with failing runs of submission compilations or matches can sometimes be resolved via a admin requeue. To do this, in the admin panel, select the checkbox for each submission/match, and then go to the dropdown above the table and select "Force requeue". This approach is quick and requires no code change, so it's always an easy place to start.

## Deleting things from the database

Generally this is discouraged, but in desperate situations, it can be a helpful measure.

You can delete any submissions as you please. Do this from the admin panel (go to the list, check boxes, click the dropdown, etc)

_You can only delete a suffix of matches -- ie, only the last N matches for any N -- in the database_. Again this is done through the admin panel.

## Resetting people's passwords

Sometimes, password resets don't go through, since users never get the emails, due to issues with our email backend. No email backend will ever be failproof, so here are some other methods:

- Have users switch to a different email address, with which that they can receive emails from our backend. You can make this switch in the admin panel. Then, have them request a new password through the normal means.

## Administering Backend Emails through Mailjet

If automated emails from the backend server stop sending, or if you have other issues with these emails, see `emails.md` in this folder. Feel free to add any new notes there too!

## Getting competitors' email addresses

Announcements, first and foremost, should be made through Discord and through our own website. However, email is occasionally helpful to make announcements, but to do this, you'll need to obtain the email addresses of competitors.

On the admin panel, go to the "Users" list, and find the "Export" button in the top-right. Then get the user data as a format of your choice (csv is perhaps best) and pull out the email column.

Getting a _single_ episode's email addresses of competitors is not yet supported, and is being tracked in #691.

## Running a tournament

Instructions and tips for running a tournament can be found in the following google doc (unlike the rest of the documentation. Maybe they should be here too? But, tournament running instructions are still very unstable).

https://docs.google.com/document/d/1AlunZNJ9xJ8nHBAiGBR3P-0IbkD9jxN39KtuM2v4oYs/edit
