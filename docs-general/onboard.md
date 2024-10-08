# General onboarding

And a laundry list of general helpful development tips/guides.

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

![System Diagram](system-diagram.png)

### The big stuff

Here, we introduce the systems through tracking the flow of information.

First, a competitor uses their own computer to load up `play.battlecode.org`, thus visiting the _frontend_. Through the competitor's interactions, the frontend makes Internet requests to the _backend_. The backend allows these requests via the _API_, an interface that the backend defines to communicate with the outside world. Finally, the backend stores and retrieves bulk amounts of data in the _database_. Our database is a SQL database, and generally holds tabular records of structured data.

For viewing general information or managing team/user data, the flow of data generally ends here. However, when a user wants to submit new source code for their bot, or request a scrimmage against another team... these are more involved.

Most importantly, in these cases, the backend puts info about this request onto a _Pub/Sub_, which works very similarly to a queue. (We use two of these, one for submitting code and the other for requesting scrimmages.) In a Pub/Sub, a "publisher" puts messages into a collection. Then a "subscriber" automatically polls for messages from the collection, processes them as they please, and deletes them. "Topics" categorize messages, so that we can separate different Pub/Sub needs.

Furthermore, the backend also stores other information into the database for records. Also, for a submission, the backend saves the competitor's source code in _Google Cloud Storage_.

(_Google Cloud Storage_ is is Google's simple file storage, which works similarly to Google Drive or other file-and-folder based stores. At the top level, there are "buckets", which contain a filesystem with folders and files. Buckets are mostly the same as a folder, but they also specify properties (e.g. locations, public/private), which is useful for separating data based on those properties. `mitbattlecode-production-ephemeral` is a special bucket configured to auto delete files after one day, used for resume book temporary storage and other temp needs.)

This request is then taken off the respective Pub/Sub collection and processed by either a _compile runner_ (also called a compile server or submission server) or a _execute runner_ (also called an execute server or scrimmage server). A compile runner takes in the request, gets the competitor's source code from Cloud Storage, compiles this code through running Java commands, uploads the compiled code back to Cloud Storage, and tells the backend to update the database accordingly (to reflect the completion of compilation). An execute runner follows a similar process, though with matches rather than submissions.

#### Deploys

Of course, all our machines (servers, databases, etc) must be deployed somewhere in order to run.

Our backend is deployed via _Cloud Run_. This is more like a set of machines that Google operates, that runs code for you. Because the machines are operated by Google, we don't get much power over them. For example we can't SSH into them. Cloud Run may run multiple instances of your code (and will spread out the load). We use this because it's generally cheaper. But since it's limited for certain operations, we can't use Cloud Run for everything.

Our compile and execute runners are deployed and run through Google Cloud's _Compute Engine_ which allows you to create and run arbitrary virtual machines (VMs). Our virtual machines are deployed via Docker, an system for constructing VMs with any content and running those VMs on a variety of operating systems. For example, we can use Docker to install Django and automatically run your code. Learn more at [their page](https://www.docker.com).

Builds (the process of going from source code to things running on deployed machines) are done via _Cloud Build_. We configure Cloud Build to run in response to various "triggers", and we specify our triggers to be new tag created on a repository.

To specify a commit to be deployed, on GitHub, assign a _tag_ to that commit. In particular, give the tag a certain prefix (see previous tags for examples). Cloud Build will see the tag, notice it matches a configured regex pattern, use the Docker information in your repo, and deploy what is specified by your tag!

All our configuration about deploys is specified via _Terraform_, an infrastructure-as-code service. See the `deploy` file for more.

### Other parts

While these parts need less active work and maintenance from devs, they are still important to know.

The _IAM_ system is how Google Cloud gives specified users specified access to the project. Make sure to give people what they need, and revoke from people what they don't need. _Service Accounts_ are "fake people"; they are accounts used by our programs to interact with GCP.

_Titan_ is our integrated malware scanner. At the end of competition, competitors upload files ostensibly containing their resumes to our site, which are compiled into a resume book given to sponsors. To prevent funny business, Titan intercepts and scans these files, and marks safe ones.

The _Secret Manager_ is a Google product, that holds our internal secrets, such as our password to manage the database. This prevents us from having to put passwords and authentication tokens in our code (ask older devs for horror stories). Instead, deployed components access Secret Manager to get the passwords, and can inject these into the flow of code.

The _Artifact Registry_ is a Google product that holds and organizes Docker containers. We use containers to standardize and deploy our backend servers and our compile/execute runners. The number of total servers running at any time scales up and down depending on how much we need, through processes we have defined ourselves.

Google's _Cloud Build_ turns our source code into real machines running that code, and allows us to manage and customize this process as well.

An extra layer of abstraction is created with the _Load Balancer_. This takes all HTTP requests to our domain, and points each request to the right place (ie IP address) in our system. Similarly, we have our domain name and DNS resolution configured within Google Cloud as well.

Furthermore, many of these systems can have multiple instances running. For example, GCP can run multiple backend servers, in order to do more operations at the same rate, thus handling more network traffic and competitor usage. This scalability is enabled by the Load Balancer, which can distribute requests across these multiple instances.

### The billing page

While not technically a component, the _billing section / page_ of Google Cloud's interface contains lots of important information. Most importantly, it shows how much money we've spend over any period of time, and where that money is spend. Please monitor it in order to generally keep our costs in control, especially to check if we spend suspiciously high amounts of money.

### The environments

While all these components exist, multiple "copies" exist in each _environment_. We have differing environments, each with their own sets of data and components, to enable simple development and debugging.

A simple list of environments:

- the Production (or Prod) environment, which is the "real" set of machines and data, and the "source of truth" for competitors and thus for us too. Because real data exists here, **when developing, do not introduce fake or junk data here.** Also, **use good passwords here**.
  - The backend exists at `https://api.battlecode.org/`. Of course, this is deployed somewhere.
  - The frontend is the set of static files that exists at `https://play.battlecode.org/`
  - The static cloud storage data lives in buckets that start with the prefix `mitbattlecode-production-` .
  - Similarly, there is a specific database for the Prod environment, called the `production-siarnaq-db`, that lives as its own set of tables at its own IP address.
  - The infrastructure servers (compile and match servers) are from the instance templates that start with `production-saturn-`.
- the Local / Dev / Development environment, which is any set of code that runs from your machine. Because their source code can be easily changed and re-run, this is generally most helpful for development.
  - The backend can be spun up following the instructions in that folder's readme, and will serve out of somewhere on your localhost. Migrations must be run manually.
  - The frontend is similar: it can be spun up following the instructions in that folder's readme, and will serve out of somewhere on your localhost.
  - Static cloud storage and infra _does not really exist_ in local development. So if you need to easily change those, consider staging or a mix of environments -- keep reading!
- the Staging environment, which is a replica environment of the Prod one, but with its own data. The setup is very similar to the Prod environment (by design!) but at its own places.
  - The backend exists at `http://api.staging.battlecode.org/`. **Note that this is not https**; unfortunately using HTTPS will error with unhelpful messages. See #526 for tracking.
  - The cloud storage data are in buckets starting with `mitbattlecode-staging-` .
  - The database is called `staging-siarnaq-db`.
  - The infra servers' instance templates have the prefix `staging-saturn-`.
  - The components generally auto-deployed each time we create a release. If you want to just only deploy staging components (and not prod ones), you can pick them manually here: https://console.cloud.google.com/cloud-build/triggers?project=mitbattlecode . Make sure you _specify the commit for the state of code you want to deploy_, too.
  - There is no staging frontend. :(( This is doable to set up although pretty difficult, which is part of why we never got around to it. Another part of it is that you can work around it with mixed environments -- read on for more.

By default, each environment works as a self-contained set of things. So when developing, set up an environment in full, and add code changes to part as you'd like.

You can also mix and match environments, if you're just developing one component! This enables even easier development. Some examples:

- To develop just the frontend, you can point to the deployed staging backend to make things faster. Run a local frontend and make your quick changes there. But change where the backend points to in the frontend's `.env.development` file, and switch those URLs to the URLs of the staging backend.
- You can "quickly" develop the backend by running it locally, but pointing it to the staging database/cloud/infra, by following the instructions in the readme there. In order to have something actually interface with this backend, you'll probably need to spin up a local frontend without changes but pointing to your local backend too.
  - If testing the backend's responses to things you don't have direct control over (such as the infra), you can spoof requests to the backend.
- When developing and testing the infra, it's hard to make quick changes. But in order to test the effects of this on the backend, you can spoof the results, using a HTTP development environment of your choice such as Postman.

Other more advanced combinations may exist. If you find them, feel free to spread the word, and list them here!

### Amazon Web Services

We also have an account on Amazon Web Services (AWS), as we used to do filestorage and deploys in AWS. Accordingly, there are still old databases, replays, submissions, game specs, etc, in AWS.

An interesting and helpful project one day is to migrate all this old data into GCP. Even if the old databases don't become merged with our primary GCP database, it would still be good to have all _data_ live in GCP instead.
