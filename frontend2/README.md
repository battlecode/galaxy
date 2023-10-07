# Battlecode Frontend

The new and improved frontend, for the Battlecode competitor portal.

## Local setup

See [docs/local-setup.md](docs/local-setup.md).

## Important scripts

See [docs/create-react-app.md](docs/create-react-app.md) or [package.json](./package.json) for lesser-used scripts.

You can run the scripts below in the project directory.

`npm run start`

Runs the app in the development mode. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

`npm run lint`

Runs ESLint and Prettier checks.

`npm run format`

Applies ESLint and Prettier fixes.

`npm start`

Runs the app in the development mode. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Codebase intro

See [docs/onboard.md](docs/onboard.md) for an introduction to the frontend codebase, in order to make changes. This is helpful not only for frontend devs themselves but also for **just a working knowledge of frontend features, even if you're not a frontend dev!**

## Generate API types

We use a bash script to generate API types / functions from our backend code automatically. To run the bash script, ensure you have followed all the setup setps in the top-level directory and in [docs/local-setup.md](docs/local-setup.md).

The following steps assume that you begin in the `galaxy` directory.

1. `cd ./frontend2`
2. `./generate_types.sh` (runs the bash script)
