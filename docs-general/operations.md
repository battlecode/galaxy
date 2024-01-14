# Operations

## Enabling a new episode

This is a outline (non-exhaustive) of necessary tasks when creating and releasing a new episode, such as releasing every new annual game.

Some of these tasks may fall outside the dominion of webinfra. If they looks like something that engine / client should do, then bug them to di it instead.

### Preparing before release

- Determine various info about the episode, especially prize and tournament info. (This should be done by the presidents, etc. You can also do this later.)
- Add episode to backend
  - This should be easy via the admin panel. You'll have to add various information there
- Add tournaments to backend
  - If exact tournaments and schedule is not known, estimates are fine. (Or you can skip this step for now.)
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
- Release a new _private_ (at first) version of the engine and client when ready. Instructions for this should be in the respective readme. (You can ask their teams to do it -- in fact, this is arguably better, for shared knowledge.)
- Now there are quite a few important things to test...
- **Test that a game can be played on the website!** Create a couple teams, submit some bots, queue up a match, etc.
- Also, **test that both clients -- web-based and native -- work!** Grab the replay from that match and load it in.
  - (The native client, especially its deploy, are sort of )

<!-- TODO scour through the past couple weeks of slack, in each channel -->

### The release!

- **At the start of the first IAP lecture, release a new public version of the game!**

## Get dev permissions

TODO, tracked in #681

## Add a dev to any team

TODO, tracked in #681

This enables lots of cool technical support things. Most notably, **this is the (currently) "unofficial-official" way to view and download a team's submissions and replays**, which is helpful in debugging.

## Resetting people's passwords

Sometimes, password resets don't go through, since users never get the emails, due to issues with our email backend. No email backend will ever be failproof, so here are some other methods:

- Have users switch to a different email address, with which that they can receive emails from our backend. You can make this switch in the admin panel. Then, have them request a new password through the normal means.

## Administering Backend Emails through Mailjet

If automated emails from the backend server stop sending, or if you have other issues with these emails, see `emails.md` in this folder. Feel free to add any new notes there too!
