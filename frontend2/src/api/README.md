This is the README for the **new** API.

- \_autogen: This contains **ONLY** auto-generated code, created by calling "./generate_types.sh"! This contains types & and auto-generated Fetch APIs. We wrap these auto-generated api functions in each endpoint's sub-folder. The only thing that FE code should import from here are models and types!

- endpoint subfolders: Each endpoint's subfolder contains three files. Below uses _episode_ as an example:
  - episodeApi.ts: exposes wrapper functions of an instance of EpisodeApi.
  - episodeKeys.ts: contains key factories for episode Query Hooks and Mutation Hooks.
  - useEpisode.ts: contains wrapper hooks for each episode api function, mutations and queries.
