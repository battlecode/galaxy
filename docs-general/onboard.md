# General onboarding

(See frontend- and backend- specific folders for less specific materials.)

## Get some experience!

First and foremost, the easiest way to get a handle on our codebase is to use everything. Go to the deployed production website, make an account, join a team, upload a bot, and start playing.

It similarly helps to run as much of the Battlecode stack as you can, especially the backend and frontend. Follow the steps in the top-level readme to set up conda, and then see each of the backend and frontend's readmes as well.

## Goals of the product

Allow a user to:

- scrimmage
- submit code
- view Battlecode information
- manage their team and user

The latter two are fairly straightforward; the first two are more complex, and involve our entire system.

## Webinfra system overview

This is a rough depiction of how webinfra code runs in practice / in deployment. All of the systems in use are run through the Google Cloud Program (GCP).

TODO drop the system diagram

## The big stuff

First, a competitor uses their own computer to visit the _frontend_. Through the competitor's interactions, the frontend makes Internet requests to the _backend_, via the API. Finally, the backend stores and retrieves data in the _database_.

For viewing general information or managing team/user data, the flow of data generally ends here. However, submissions and scrimmaging are more involved. 

In these cases, the backend puts info about this request onto a _Pub/Sub_, which works very similarly to a queue.

This request is then taken off the queue and processed by a _submission server_ or _scrimmage server_. 


Cloud Storage
TODO in this PR ^ fill in

TODO in this PR review the rest of the system diagram and write about whatever i've missed

### Other parts

While these parts need less active work and maintanence from devs, they are still important to know. 

_Titan_ is an integrated malware scanner. At the end of competition, competitors upload files ostensiby containing their resumes to our site, which are compiled into a resume book given to sponsors. To prevent funny business, Titan intercepts and scans these files, and marks safe ones.

The _Secret Manager_ is a Google product, that holds our internal secrets, such as our password to manage the database. This prevents us from having to put passwords and authentication tokens in our code (ask older devs for horror stories). Instead, deployed components access Secret Manager to get the passwords, and can inject these into the flow of code. 

The _Artifact Registry_ is a Google product that holds and organizes Docker containers. We use containers do standardize and deploy our backend servers and our compile/execute runners.

(Docker is an amazing service that enables standarized servers to run across different operating systems. You can learn more at [their page](https://www.docker.com).)

Google's _Cloud Build_ turns our source code into real machines running that code, and allows us to manage and customize this process as well. 

An extra layer of abstraction is created with the _Load Balancer_. This takes all HTTP requests to our domain, and points each request to the right place in our system. 

Furthermore, many of these systems can have multiple instances running. For example, GCP can run multiple backend servers, in order to do more operations at the same rate, thus handling more network traffic and competitor usage. This scalability is enabled by the Load Balancer, which can distribute requests across these multiple isntances.
