# Operations

## Enabling a new episode

This is a outline (non-exhaustive) of necessary tasks when creating and releasing a new episode, such as releasing every new annual game.

- Determine various info about the episode, especially prize and tournament info. (This should be done by the presidents, etc. You can also do this later.)
- Add episode to backend
  - This should be easy via the admin panel. You'll have to add various information there
- Add tournaments to backend
  - If exact tournaments and schedule is not known, estimates are fine. (Or you can skip this step for now.)
- Create the team of Teh Devs
- Have new devs create accounts.
- For _only to the people who need this_, make their accounts "admin" accounts. (Any other admin can do this from the admin panel with their IDs.) Please be cautious, safe, and secure!!
- Add episode in frontend
- Update the default episode in frontend
- Update the competition info in the frontend. (Again, you can do this later, just don't forget.) In particular, update:
  - Prizes
  - Sponsors
  - Tournament info
- Release a new version of the frontend.
- (Also, release a new version of the engine and client when ready. Instructions for this should be in the respective readme. You can ask their teams to do it.)

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
