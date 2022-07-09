# Galaxy

![CI](https://github.com/battlecode/galaxy/actions/workflows/ci.yml/badge.svg)

Galaxy is the framework that powers the infrastructure for MIT Battlecode.
The galaxy consists of two main parts:
- Saturn, the compute cluster that compiles competitor bots and runs matches.
- Siarnaq, the competitor dashboard that interfaces with our data storage.

## Development environment installation

Please follow these steps carefully to ensure your development environment is initialized correctly.

1. Clone this repository at [battlecode/galaxy](https://github.com/battlecode/galaxy).
1. Install [Conda](https://docs.conda.io/en/latest/miniconda.html), our package-manager and build-system.
   Prepare your environment using `conda env create -n galaxy -f environment-dev.yml` and `conda activate galaxy`.
1. We use [Pre-commit](https://pre-commit.com/) to sanity-check the codebase before committing.
   It will be automatically installed by Conda.
   Your local git will reject commits that fail these sanity-checks.
   Initialize Pre-commit using `pre-commit install`.

## Development workflow

Develop new features on branches and use pull-requests to request code-review.
The `main` branch is protected and pushes to `main` will be rejected.

We will be using the [Projects](https://github.com/battlecode/galaxy/projects/1) feature to track our todo list. Issues should only be used for bugs.

To start a feature, *claim* it on the Projects page by moving it to the "In Progress" column and adding your name to it. Then you can work on it on a git branch.

In places where it makes sense, it could be good to write test cases, although a lot of the functionality might not be very testable.

GitHub has been configured to automatically verify all Pre-commit checks and in the future will also run all test cases.
It's not required to make sure every commit on GitHub passes, but anything merged to main should pass. GitHub will send you an email if the checks fail.

## Technical details

We use [Mypy](http://mypy-lang.org/examples.html) for Python type-safety.
It is automatically run and verified by Pre-commit.
Use type-annotations judiciously.

In the Siarnaq backend, you are likely able to avoid loops.
If you really want a loop, think very hard before including it.
You are very likely looking for a Signal or a Celery task.

Be very careful about concurrency.
You may need a Django transaction to enforce atomicity, but only use transactions where absolutely necessary.
Move code into a Manager if it makes implementation easier.

## Running Siarnaq locally

1. Go to backend and run `./manage.py makemigrations` to generate the database definitions.
   During the initial development phase (before the first release), **do not commit** any of these auto-generated migration files, **even though they are not in gitignore**.
   Since we're still writing everything, we don't want to have a stack of migrations.
1. Run `./manage.py migrate` to initialize the database.
   This will create a file called `db.sqlite3`, which contains a toy database for testing.
   You shouldn't commit this either.
1. Run `./manage.py runserver` to turn on the server!

If you ever get your database into a really broken state, just delete `db.sqlite3` and all the migration files, and start again.

## How to contribute

If you're new to Django, it's fancy.
It's complex, but can be easy to learn if you start with the easy parts.
To get started understanding the codebase:

- Read and understand `accounts/models.py`.
- A little bit more complex is `teams/models.py`.
  Read this one next.
  Notice that there are functions that act on single objects.
  Also notice Django functions such as `filter`, etc.
- Next up, read `compete/models.py`.
  Notice Django features such as double-underscores, as in `pk__in` for filters.
- Check out `compete/managers.py` to get a sense of what we can do with Managers.

Maybe try out implementing a small feature! And always feel free to reach out and ask for help :)
