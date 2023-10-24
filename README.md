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

Afterwards, to run systems locally, see each of their respective directory's readme files.

## Development workflow

See [docs-general/workflow.md](docs-general/workflow.md) for workflow information. **Reading this page, especially the "Coding" and "Review" sections, before starting work is highly recommended.**

For specific development workflows in each module, see the README files in the respective folder.
