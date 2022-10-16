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

This automatically reloads the page on changes. To run the same thing without automatically opening a browser, run `npm run startx`, and then navigate to http://localhost:3000.

## Misc Notes

Might be helpful for troubleshooting, for you or posterity.

### Node and NPM

When installing a new Node package, always `npm install --save <package>` or `npm install --save-dev <package>`, and commit `package.json` and `package-lock.json`. This should work even if we run it from Docker. If you don't have `npm` installed on your computer, you can `docker exec -it battlecode20_frontend_1 sh` and then run the commands above.

Our local processes use `npm start` and/or `npm run start`. These commands automatically use `.env.development`, and not `.env.production`. See here for more information: https://create-react-app.dev/docs/adding-custom-environment-variables/#what-other-env-files-can-be-used.

### NPM 17 sadness

In order for npm 17 to work with these, **run `export NODE_OPTIONS=--openssl-legacy-provider` before you run any npm commands**.

(New versions of npm are incompatible with old versions of webpack. See https://stackoverflow.com/questions/69665222/node-17-0-1-gatsby-error-digital-envelope-routinesunsupported-err-ossl-evp for more.

Our issues would be resolved if we could use new versions of webpack but)

### access.txt

During deployment, you'll need an up-to-date version of `frontend/public/access.txt`. This file is needed by game runners to run matches, and by competitors because it grants them access to downloading the GitHub package containing the engine. It's is really difficult to deploy; our solution is to have it deployed with the rest of the frontend code and onto our website, but have it never pushed to GitHub. Make sure you have an up-to-date copy! If you don't have one, check with the infra devs.
