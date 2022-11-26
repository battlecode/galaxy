# Siarnaq backend

Siarnaq is the competitor dashboard that interfaces with our data storage. This module
is the backend of Siarnaq, written in Django.

## Running Siarnaq locally

1. Go to backend and run `./manage.py makemigrations` to generate the database
   definitions.
1. Run `./manage.py migrate` to initialize the database. This will create a file called
   `db.sqlite3`, which contains a toy database for testing. You should not commit this.
1. Run `./manage.py runserver` to turn on the server!

While developing, you may find the `api/specs/swagger-ui` endpoint userful for viewing
and querying the avaiable API.

If you ever get your database into a really broken state, just delete `db.sqlite3`, and
start again.

Eventually, you will have a blazing new feature you'd like to contribute, and you'd like
to test your code in the staging environment first. To authenticate, first [install the
Google Cloud SDK](https://cloud.google.com/sdk/docs/install). Then, run the following
three commands to connect your installation to our project; you may be prompted to log
in several times. You can skip any steps about configuring default regions.

```
gcloud auth application-default login --scopes=openid,https://www.googleapis.com/auth/cloud-platform,https://www.googleapis.com/auth/userinfo.email
gcloud config set core/project mitbattlecode
gcloud auth login
```

Ask someone to give you the IAM "Service Account Token Creator" role.
You can then access the staging environment by setting the environment variable
`DJANGO_CONFIGURATION=Staging`.

To check deploy readiness, verify the pre-deploy checklist by running
`./manage.py check --deploy`.

## Technical details

We use [Mypy](http://mypy-lang.org/examples.html) for Python type-safety. It is
automatically run and verified by Pre-commit. Use type-annotations judiciously.

In the Siarnaq backend, you are likely able to avoid loops. If you really want a loop,
think very hard before including it. You are very likely looking for a Signal.

Be very careful about concurrency. You may need a Django transaction to enforce
atomicity, but only use transactions where absolutely necessary. Move code into a
Manager if it makes implementation easier.

## How to contribute

If you're new to Django, it's fancy. It's complex, but can be easy to learn if you start
with the easy parts. To get started understanding the codebase:

- Read and understand `user/models.py`.
- A little bit more complex is `teams/models.py`.
  Read this one next.
  Notice that there are functions that act on single objects.
  Also notice Django functions such as `filter`, etc.
- Next up, read `compete/models.py`.
  Notice Django features such as double-underscores, as in `pk__in` for filters.
- Check out `compete/managers.py` to get a sense of what we can do with Managers.

Maybe try out implementing a small feature! And always feel free to reach out and ask
for help :)
