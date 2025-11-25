# Saturn:



Saturn is a compute cluster designed to efficiently compile competitor bots and execute matches. This system is optimized for rapid job processing and seamless scalability, leveraging Google Cloud's infrastructure for dynamic resource allocation.



---



## **Core Functionalities**



Saturn specializes in two primary operations:



1.  **Compilation of Source Code**

Converts submitted source code into executable binaries.

2.  **Match Execution**

Executes matches between compiled binaries and generates replay file results.



---



## **Data Flow**



1.  **Job Requests**

Received through dedicated Pub/Sub topics.

2.  **Processing**

Saturn uses the appropriate pipeline for job execution: compilation or match processing.

3.  **Code and Engine Retrieval**

Pulls the scaffold and game engine from GitHub using a Git token stored in Google Secret Manager.

4.  **Result Storage**

Results and artifacts are stored in Google Cloud Storage.

5.  **Report Delivery**

Result reports are sent back to Siarnaq via HTTP POST.



---



# **Local Development Guide for Saturn**



## **Overview**



Simulating Saturn’s distributed system locally can be challenging. To facilitate this, a Docker image with a Pub/Sub emulator is provided in the `development` folder.



---



## **Development Environment Setup**



### **Prerequisites**



- Docker installed on your local machine

- Access to Google Secret Manager



---



### **Steps**



#### 1. Prepare Secret File

- Access our Google Cloud's Project Secret Manager.
- Copy the Git token from our production-saturn secret
- Create a `secret.json` file in the `development` directory containing the required Git token.



#### 2. Build Docker Image

Navigate to the `development` directory and run:

```bash

cd  development
docker  build  -t  pubsub-emulator  .

```

## **Running the System**



Two processes must run simultaneously:



### **1. Start Pub/Sub Emulator**



In the `development` directory, execute:

```bash

docker  run  -it  --rm  --network  host  \
-v $(pwd):/development  \
pubsub-emulator

```

### **2. Build and Run Modified Saturn

In the `saturn` directory:

Build Saturn Image:

```bash

docker build -t saturn .

```

Run Saturn Container:

```bash

docker  run  --network  host  \
-e  PUBSUB_EMULATOR_HOST=localhost:8514  \
-v $(pwd)/development:/development  \
saturn  -subscription=test  -project=mitbattlecode  -onsaturn=false  \
-secret="/development/secret.json"

```


## **Interacting with the System**

When the system starts, the `pubsub-emulator` image runs the `./startpubsub.sh` script, which performs the following tasks:
1. Starts the Pub/Sub emulator, listening on port `8514`.
2. Creates a topic called `testing-saturn`.
3. Creates a subscription called `test` (used to pull messages).

---

### **Sending Messages to Pub/Sub**

The Pub/Sub process listens for commands. Execute `./pubsubclient` tool to view the full list of available commands.
Here are two quick and commonly used commands:

- **`./pubsubclient pub compile`**: Sends the message defined in `compile.json`.
- **`./pubsubclient pub execute`**: Sends the message defined in `execute.json`.


### **Configuring Messages**



- Modify the `compile.json` or `execute.json`files to specify different languages and different file paths for source code, binaries and report-url.

- Set the report path for local storage.

- Use `/development/<file>` paths in both images for seamless synchronization.



---



## **File Management**



- The `development` directory is mounted as `/development` in both images.

- Any changes made to the `development` directory are automatically reflected in the images.

- You can create or modify JSON files for the Pub/Sub emulator and add source code for Saturn without rebuilding the Docker images.



---



## **Security Note**



Files matching `*secret.*` are included in `.gitignore` to prevent sensitive information from being accidentally committed.



---



## **Example JSON Files**



Refer to the `compile.json` and `execute.json` files for examples of messages sent through Pub/Sub. Adjust these files as necessary for testing and development. Don't commit any changes to these files.
