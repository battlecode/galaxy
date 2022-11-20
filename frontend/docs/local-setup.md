# Local Setup Instructions

## One-Time Setup

First, make sure you have **prepared your Conda environment, according to the top-level readme.**

Then, run

```
npm install
```

## Running

Make sure that the backend is running. (You can hook up to a deployed backend, or run it locally. Then make sure `.env.development` points to that backend.)

In **this directory**, run:

```
npm run start
```

This automatically reloads the page on changes.

## Misc Notes

Might be helpful for troubleshooting, for you or posterity.

### Node and NPM

When installing a new Node package, always `npm install --save <package>`, and commit `package.json` and `package-lock.json`.

Our local processes use `npm start` and/or `npm run start`. These commands automatically use `.env.development`, and not `.env.production`. See here for more information: https://create-react-app.dev/docs/adding-custom-environment-variables/#what-other-env-files-can-be-used.
