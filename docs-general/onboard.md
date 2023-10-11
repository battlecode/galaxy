# General Onboarding

(See frontend- and backend- specific folders for less specific materials.)

## Get some experience!

First and foremost, the easiest way to get a handle on our codebase is to use everything. Go to the deployed website, make an account, join a team, upload a bot, and start playing.

It similarly helps to 

## Goals of the Product

Allow a user to:

- scrimmage
- submit code
- view Battlecode information
- manage their team and user

The latter two are fairly straightforward; the first two are more complex, and involve our entire system.

## Webinfra System Overview

This is a rough depiction of how webinfra code runs in practice / in deployment, 

TODO drop the system diagram

Competitor's local frontend

Backend server

When competitors want to submit their code or run a scrimmage, they send a request to our API, which puts info about this request onto a "queue". (Technically it's not first-in first-out, but, y'know, abstraction.) 

Cloud Storage

Titan is an integrated malware scanner. At the end of competition

Secret Manager is a Google product, that holds our internal secrets, such as our password to manage the database.

The Artifact Registry is a Google product that holds and organizes Docker containers. We use containers do standardize and deploy our backend servers and our compile/execute runners.

TODO include a cool link to Docker! 

(An extra layer of abstraction: the Load Balancer . It adds an extra dimension to the system. )

So finally what controls all this? What tells it to come alive? Google Cloud Build is 
