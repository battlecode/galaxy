# Local Setup Instructions

## One-Time Setup

First, make sure you have [Node](https://nodejs.org/en/download/) installed. (Also, on Windows, [Cygwin](https://www.cygwin.com/) is recommended to use as your terminal environment.) Then, in this directory, run:

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

### NPM 17 sadness

In order for npm 17 to work with these, **run `export NODE_OPTIONS=--openssl-legacy-provider` before you run any npm commands**.

(New versions of npm are incompatible with old versions of webpack. See https://stackoverflow.com/questions/69665222/node-17-0-1-gatsby-error-digital-envelope-routinesunsupported-err-ossl-evp for more.

Our issues would be resolved if we could use new versions of webpack but)
