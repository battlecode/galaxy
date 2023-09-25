# Galaxy

![CI](https://github.com/battlecode/galaxy/actions/workflows/ci.yml/badge.svg)

Galaxy is the framework that powers the infrastructure for MIT Battlecode.
The galaxy consists of three main parts:

- Siarnaq, the competitor dashboard that interfaces with our data storage. (Siarnaq, in turn, has two parts: a frontend and a backend.)
- Saturn, the compute cluster that compiles competitor bots and runs matches.
- Titan, the malware scanner that scans all file uploads.

## Development environment installation

Please follow these steps carefully to ensure your development environment is initialized correctly.

1. Clone this repository at [battlecode/galaxy](https://github.com/battlecode/galaxy).
1. Install [Conda](https://docs.conda.io/en/latest/miniconda.html), our package-manager and build-system.
   Prepare your environment using `conda env create -n galaxy -f environment-dev.yml` and `conda activate galaxy`.
1. We use [Pre-commit](https://pre-commit.com/) to sanity-check the codebase before committing.
   It will be automatically installed by Conda.
   Your local git will reject commits that fail these sanity-checks.
   Initialize Pre-commit using `pre-commit install`.

If the Conda specifications are updated upstream, you can refresh your local environment to match it by running `conda env update -n galaxy -f environment-dev.yml`.

## Development workflow

For specific development workflows in each module, see the README files in the respective folder.

Develop new features on branches and use pull-requests to request code-review.
The `main` branch is protected and pushes to `main` will be rejected.

<!-- Legacy writing; we don't use Projects anymore. If we ever resume so, uncomment this -->
<!-- We will be using the [Projects](https://github.com/battlecode/galaxy/projects?type=classic) feature to track our todo list.
Entries in the "To do" column are allowed to simply be items created in the project board, but once the entry moves to one of the other columns (e.g. "In progress"), please convert the entry into an issue for easier discussion and reference in PRs.

To start a feature, _claim_ it on the Projects page by moving it to the "In Progress" column and adding your name to it. Then you can work on it on a git branch. -->

In places where it makes sense, it could be good to write test cases, although a lot of the functionality might not be very testable.

GitHub has been configured to automatically verify all Pre-commit checks and in the future will also run all test cases.
It's not required to make sure every commit on GitHub passes, but anything merged to main should pass. GitHub will send you an email if the checks fail.
