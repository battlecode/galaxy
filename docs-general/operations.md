# Operations

## Enabling a new episode

This is a outline (non-exhaustive) of necessary tasks when creating and releasing a new episode, such as releasing every new annual game.

Some of these tasks may fall outside the dominion of webinfra. If they looks like something that engine / client should do, then bug them to di it instead.

### Preparing before release

#### Prerequisites

- Determine various info about the episode, especially prize and tournament info. (This should be done by the presidents, etc. You can also do this later.)
- Have new devs create accounts.
- For _only to the people who need this_, make their accounts "admin" accounts. (Ask around if you don't know how to do this.) Please be cautious, safe, and secure!!

#### Backend

- Add episode to backend
  - Through the admin panel, fill out each field
  - Fill in the scaffold url (the github link to our scaffold, e.g. https://github.com/battlecode/battlecode24-scaffold)
  - Fill in the artifact name (as defined in `build.gradle` in the client/engine repository)
  - Fill in the scaffold URL, artifact name, and the release versions
  - Release version public/saturn can be empty for now. When a new version of the game is released, enter them here.
  - Fill in the release time. Game release is when the specs and javadocs will be publicly available. This should be during the first lecture.
- **Add tournaments to backend**
  - If exact tournaments and schedule is not known, estimates are fine. Or you can skip this step for now. Make sure you come back to it though!
  - Input each tournament, especially along with its time
  - Typically, only the sprint tournaments are single elimination, and all other tournaments are double elimination.
  - Input all **eligibility criteria** for each tournament. Also, in order to do that, **create each eligibility criteria in the database table**.
    - When creating an eligibility criteria, design it so that its meaning _defaults to "No", and so that teams explicitly have to say "Yes" in order to join tournaments._ This is because, by default, a new team will not state that they satisfy any eligibility criteria. Instead, they have to actively check some boxes in order to indicate satisfaction.
      - For example, a good eligibility criterion is "Is High Schooler?", because a team must explicitly check the box to participate in the High School tournament. If they fail to check the box (which they likely might, by forgetting, or by leaving the competition before tournament season), then they will not be added to the tournament.
      - Eligibility criteria from previous episodes may be helpful here.
    - Competitors are able to select the criteria they fit through their team page.
  - Remember to **check the box `Require resume` for all non-sprint tournaments.**
  - Submission deadlines are usually **a little bit after 7pm** the day before the displayed tournament date. The displayed date is when the tournament is streamed live, during normal lecture time. Set the submission unfreeze to be after the tournament is streamed live.
  - **Tournament submission freeze times (ie submission deadlines) should be set to be slightly later than the nominal time. For example, if a tournament is nominally 7pm, set the submission freeze time to something like 7:00:30 or 7:01.**
    - This allows for leniency with differences in clocks.
    - Also, this enables an autoscrimmage round to run before the submission deadline, which can be helpful to converge seeds.
  - Leave `External id private/public` empty. These will be automatically filled in upon initializing the tournament.

#### Frontend

- Add episode in frontend
  - This is needed for frontend systems that keep an enumeration of the episodes (just as the backend does). If your frontend doesn't have a redundant list of episodes, then don't worry about this step.
- Update the default episode in frontend
- Update the competition info in the frontend. (Again, you can do this later, just don't forget.) In particular, update:
  - Prizes
  - Sponsors
  - Tournament info
- Release a new version of the frontend.

#### Game releases

- Release a new _private_ (at first) version of the engine and client when ready. In particular, **set IS_PUBLIC=NO in release.yml, and have the release number be below 1.0.0**
  - Instructions for this should be in the respective readme. (You can ask their teams to do it -- in fact, this is arguably better, for shared knowledge.)
- **Give, to the battlecodedownloadpackage "account", access to the scaffold. This is necessary for testing before the public release**
- Add maps that we plan to release too, which is helpful for testing.
  - Add them here: https://api.battlecode.org/admin/episodes/map/add/

#### Class setup

- Create the team of Teh Devs for the year
- There is a user whose username is “admin”. Log into it and create a new team called “Reference Player” (ideally, before that team name gets stolen :stuck_out_tongue:)
  - “admin” will be the only member of Reference Player.
  - On api.battlecode.org/admin, set the team type to Invisible. you don’t want anyone to try to scrim against it yet
  - I forgot “admin”’s password but you can reset it at api.battlecode.org/admin. The password should be “good” because the account has at least as many permissions as yours, if not more.
  - NB! Teams with no members will get deactivated. Your personal account should stay on Teh Dev team. This is why “admin” exists: so that Reference Player can exist without needing you to stay on it.

#### Pre-release testing

- **Test that a game can be played on the website!** Create a couple teams, submit some bots, queue up a match, etc.
- Also, **test that both clients -- web-based and native -- work!** Grab the replay from that match and load it in.
  - (Building and deploying the native client is an especially complex process, and so it benefits from some extra attention.)

### The release!

- **At the start of the first IAP lecture (roughly 7pm sharp), release a new _public_ version of the game!**
  - Ensure that the release info in `release.yml` in the engine/client repository has `IS_PUBLIC: YES`.
  - Also, have this version be v1.0.0 .
  - You can ask the engine/client teams to do this, like with the prerelease testing versions.
- Add and publish the maps we'll be releasing. Maps must be published through the admin dashboard before competitors can scrimmage with them. See here: https://api.battlecode.org/admin/episodes/map/add/
- Update the versions that the backend and infrastructure use. Go to https://api.battlecode.org/admin/episodes/episode/{episodeId}/change/ and update `Release version public` and `Release version saturn` to 1.0.0
- Fill in the autoscrim schedule, in the episode info: https://api.battlecode.org/admin/episodes/episode/{episodeId}/change/
  - The schedule is specified in the syntax for a cron job (unfortunately, cuz the backend hands the episode info schedule to Google's Cloud Scheduler, which uses cron job syntax)
  - Take this with a grain of salt, this might be wrong. But: To do every 4 hours, specify as `0 */4 * * *`.

### Each tournament

Instructions and tips for running a tournament can be found in the following google doc (unlike the rest of the documentation. Maybe they should be here too? But, tournament running instructions are still very unstable).

**Before the first tournament, read over this in its entirety. It is helpful to also do a full practice run as well.**

https://docs.google.com/document/d/1AlunZNJ9xJ8nHBAiGBR3P-0IbkD9jxN39KtuM2v4oYs/edit

### Before final tournament

- **Remove any devs from regular teams!!!!** If a dev is on a regular team (and hasn't submitted a resume), the dev could invalidate the team from being eligible for prizes.

- Set up custom eligibility criterion for the final tournaments
  - To pull only a specific set of teams (ie the finalists)
  - NB: Finalists will not be seeded in order of finish during quals, but instead, using current rankings (including any laddering after quals). This is probably fine. But if people object, consider working around this
- Prepare for students getting grades!
  - Set up ReferencePlayer
    - Log into the "admin" account, which should already contain the "Reference Player" team
    - Put the `referenceplayer` user on that team
    - Upload the ReferencePlayer bot to the Reference Player team
      - **NB! Teh Dev team will always run examplefuncsplayer, and never change**
    - change “Reference Player” to Staff instead of Invisible
      - NB! important to be “Staff” and not a regular team. Results of scrims against Staff teams are redacted in the Queue to protect students from having their grades exposed
  - Select maps for students to use while challenging `referenceplayer`
  - **Input this into a ClassRequirement on the database** to help you automatically calculate who passed
    - Do it here: https://api.battlecode.org/admin/teams/classrequirement/
  - Announce to students that ReferencePlayer is ready, along with some instructions, including:
    - **the scrimmage request must be an unranked scrimmage request**
    - **the maps of the scrimmage must exactly match the maps on the ClassRequirement**
      - Users don't have access to view the ClassRequirement, so you should spell out the users here
    - And perhaps other stuff that I can't think of rn. Check with the presidents!
  - Monitor that people are passing the class
    - Use this endpoint to get results: `https://api.battlecode.org/api/team/{episode}/requirement/{requirementId}/compute/`
  - Get final grades (whenever deemed fit) using that same endpoint

## "Customer Support"

There's a bunch of stuff that competitors will experience and might ask. Here are a bunch of tools and methods to help them.

## Monitoring

Occasionally things might break. Then, Discord might light on fire, and Discord notifications/pings might light on fire.

Other symptoms include:

- Many failed submission compilations or match runs
- In a Pub/Sub, lots of un-acknowledged messages

### Add yourself (as a dev) to any team

**Only do this with a team's permission** (and also, if anyone else sees this, feel free to call the dev out).

Also, when you're done, **make sure to undo this**

As a dev you can join any team even with the wrong join key. Just keyboard mash into “join key” and you’re all set. Once you’re done, rejoin the dev team, as this clears up some eligibility complications down the road.

This enables lots of cool technical support things. Scroll down for more!

### Viewing any submission

There's a couple of ways to do this.

Get the submission ID in question. Then

Or, join the relevant team, and scroll through their submission history.

### Viewing any match

Obtain the match ID (the hex string). You can ask this from the team, or get this by joining their team and scrolling around.

Then, load it ino the web-based client, specifying the ID in the URL.

**Note: Match IDs are generally confidential** (which is why they are long hex strings in the first place). Don't share match IDs unnecessarily.

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
