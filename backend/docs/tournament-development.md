# Tournament development guide

It’s annoyingly difficult to set up local development for tournament servers, especially cuz the environment is a mix of things, including the Challonge system itself. Here’s a dump of tips that have helped in the past. Feel free to update as you see fit!

## Our challonge setup:

- We maintain two Challonge accounts, mitbattlecode for the production env and `mitbattlecodestaging` for the staging environment.
  - Useful occasionally to view and edit brackets straight from the website
- Each account also has an API Key, which lets us use Challonge’s new API!

### Environment tips:

- Use the staging environment, since it’s best to run test matches/submissions there, and it also easily connects to Challonge.
- Make several teams (6 is best), all with simple, deterministic bots so that any matches are predictable you can assume the behavior of matches. (Eg bots that resign after N turns for small N)
  - For example, I called these teams and bots things like `resignplayer4`
- Run a local backend (for quick local changes), but point it to the staging environment (ie the database, Saturn servers, etc). Follow the instructions in the backend readme for setup.
  - Use the local backend panel of course to test your changes.
  - (If you also need to use the frontend, spin up a local frontend, connected to the local backend)
- (If using deployed staging, the secret manager should have a copy of the Challonge API key, so no need to grab it.)

## Development tips:

- As an API reference for Challonge, use the following links. (kinda hard to find)
  - https://api.challonge.com/v2/api_docs/single_swagger_doc for an overall API endpoint documentation, including a fast playground to test in
  - https://transparent-pen-8a5.notion.site/Challonge-Connect-Documentation-ab016fd6b875474b9b67b9d8f8590497 for getting started and setting up Challonge API integration in the first place
- When matches are run, eventually, the match run servers send this to the backend. In the absence of waiting for real match servers, you can pretend to be the match running servers, and instead send spoofed reports to the backend spoofing Saturn reporting to the backend. This is doable via services like Postman, Curl, etc
  - You also don’t have to authenticate, if you disable the check for that endpoint. For example, remove `permission_classes` from the endpoint in question
- Methods are not transaction-safe! If a method call breaks in the middle of a run, then some state in the backend or Challonge may have been changed already. So, you might not be able to simply fix the method and run it as-is again.
  - Start afresh if you need, by creating a new round/match/tournament/etc
