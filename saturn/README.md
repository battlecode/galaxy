# Saturn

Saturn is a compute cluster for compiling competitor bots and executing matches. It's designed for rapid job processing and seamless scalability using Google Cloud infrastructure.

## Core Functionality

1. **Compilation** - Converts source code to executable binaries
2. **Match Execution** - Runs matches between compiled binaries and generates replay files

## Data Flow

1. Job requests arrive via Pub/Sub topics
2. Saturn processes jobs using the appropriate pipeline (Java 8, Java 21, or Python 3)
3. Code and game engine scaffolds are pulled from GitHub (using Git token from Secret Manager)
4. Results stored in Google Cloud Storage (or local filesystem in development)
5. Reports sent back to Siarnaq via HTTP POST

---

# Local Development

## Quick Start

**Prerequisites:** Docker, gcloud CLI (authenticated)

```bash
cd saturn
make dev-fetch-secret    # Fetch secrets from GCP
make dev-build          # Build Docker images
make dev-docker-up      # Start all services (creates new run)

# In another terminal:
make dev-compile        # Test compilation
make dev-execute        # Test execution
```

To stop services:
```bash
make dev-docker-down
```

**Note:** After making code changes to Saturn's Go code, rebuild with:
```bash
make dev-docker-down
make dev-build
make dev-docker-up
```

---

## Architecture Overview

The development environment consists of two Docker containers:

1. **saturn-dev** - The main Saturn worker that processes compile and execute jobs
   - Runs the Saturn Go application
   - Includes Java 8, Java 21 (Eclipse Temurin), and Python 3.12
   - Clones and manages battlecode scaffolds
   - Executes Gradle builds and matches

2. **saturn-pubsub-dev** - Local Pub/Sub emulator with custom client
   - Runs Google Cloud Pub/Sub emulator
   - Includes custom Go client (`pubsubclient`) for sending test messages
   - Provides interactive shell with command history (rlwrap)

### Run Management

Each time you start services with `make dev-docker-up`, a new **run** is created with a unique timestamp ID (e.g., `20260102_222656`). This keeps test runs isolated:

```
development/runs/
├── 20260102_222656/           # Run ID (timestamp)
│   ├── scaffolds/             # Cloned game scaffolds
│   ├── logs/                  # Container logs
│   │   └── combined.log
│   └── requests/              # Individual job requests
│       ├── compile_20260102_222719/
│       │   ├── config.json
│       │   ├── report.txt
│       │   └── binary.zip
│       └── execute_20260102_222845/
│           ├── config.json
│           ├── report.txt
│           └── replay.bc25java
└── latest                     # Symlink to current run
```

---

## Development Workflow

### 1. Sending Test Jobs

Use the Make commands to send test jobs. Each job creates a unique request directory with timestamped ID:

```bash
make dev-compile    # Sends a compile job
make dev-execute    # Sends an execute job
```

These commands:
1. Generate a config from the template (`development/configs/*.template.json`)
2. Create a unique request directory under the current run
3. Send the job via Pub/Sub to Saturn
4. Saturn processes the job and writes results to the request directory

### 2. Viewing Logs

```bash
make dev-docker-logs              # View logs for current run
make dev-view-run RUN_ID=<id>    # View logs for specific run
make dev-list-runs               # List all test runs
```

### 3. Managing Test Runs

```bash
make dev-list-runs     # List all runs with scaffold/log info
make dev-clean-runs    # Clean old runs (keeps latest 5)
```

### 4. Interactive Pub/Sub Client

For more control, use the interactive Pub/Sub client:

```bash
make dev-shell-pubsub              # Open shell in Pub/Sub container
./pubsubclient                     # Show available commands
./pubsubclient list-topics         # List all topics
./pubsubclient subscribe test      # Listen for messages
```

---

## Job Configuration

Jobs are configured using JSON template files in `development/configs/`:

### Compile Job (`compile.template.json`)

```json
{
  "episode": {
    "name": "bc25java",
    "language": "java21",           // java8, java21, or python3
    "scaffold": "https://github.com/battlecode/battlecode25-scaffold"
  },
  "metadata": {
    "report-url": "{{REPORT_PATH}}",  // Auto-filled by make command
    "task-type": "compile"
  },
  "details": {
    "source": {
      "bucket": "local",
      "name": "/development/test-data/source/java21.zip"
    },
    "binary": {
      "bucket": "local",
      "name": "{{BINARY_PATH}}"       // Auto-filled by make command
    },
    "team-name": "test",
    "package": "examplefuncsplayer"   // Main package/module name
  }
}
```

### Execute Job (`execute.template.json`)

```json
{
  "episode": {
    "name": "bc25java",
    "language": "java21",
    "scaffold": "https://github.com/battlecode/battlecode25-scaffold"
  },
  "metadata": {
    "report-url": "{{REPORT_PATH}}",
    "task-type": "execute"
  },
  "details": {
    "maps": ["fix", "galaxy", "gridworld", "quack", "sierpinski"],
    "replay": {
      "bucket": "local",
      "name": "{{REPLAY_PATH}}"       // Auto-filled by make command
    },
    "alternate-order": true,
    "a": {
      "binary": {
        "bucket": "local",
        "name": "/development/test-data/binary/java21.zip"
      },
      "team-name": "team-a",
      "package": "examplefuncsplayer"
    },
    "b": {
      "binary": {
        "bucket": "local",
        "name": "/development/test-data/binary/java21.zip"
      },
      "team-name": "team-b",
      "package": "examplefuncsplayer"
    }
  }
}
```

### Template Placeholders

When using `make dev-compile` or `make dev-execute`, the following placeholders are automatically replaced:

- `{{REPORT_PATH}}` - Path to write the result report
- `{{BINARY_PATH}}` - Path to write the compiled binary (compile jobs)
- `{{REPLAY_PATH}}` - Path to write the game replay (execute jobs)

These paths are generated based on the current run ID and request timestamp.

---

## Directory Structure

```
saturn/
├── cmd/saturn/main.go          # Saturn entry point
├── pkg/                        # Saturn Go packages
│   ├── run/                    # Job execution logic
│   ├── saturn/                 # Core types and interfaces
│   └── storage/                # Storage backends (GCS, local)
├── Dockerfile                  # Saturn production image
├── Makefile                    # Development commands
└── development/
    ├── Dockerfile              # Pub/Sub emulator image
    ├── docker-compose.yml      # Service orchestration
    ├── pubsubclient.go         # Custom Pub/Sub client
    ├── configs/                # Job templates
    │   ├── compile.template.json
    │   └── execute.template.json
    ├── secrets/                # GCP secrets (git-ignored)
    │   └── secret.json         # Git token for scaffold cloning
    ├── test-data/              # Test source/binary files (git-ignored)
    │   ├── source/
    │   │   ├── java21.zip
    │   │   └── py3.zip
    │   └── binary/
    │       └── java21.zip
    └── runs/                   # Test run outputs (git-ignored)
        ├── latest              # Points to current run
        └── 20260102_222656/    # Run directories (timestamped)
            ├── scaffolds/      # Cloned game scaffolds
            ├── logs/           # Container logs
            └── requests/       # Job request outputs
```

---

## Make Commands Reference

### Setup Commands
```bash
make dev-fetch-secret       # Fetch secrets from GCP Secret Manager
make dev-build             # Build Docker images for both containers
```

### Service Management
```bash
make dev-docker-up         # Start services (creates new run, tails logs)
make dev-docker-down       # Stop all services
make dev-docker-logs       # View logs for current run
make dev-docker-rebuild    # Rebuild images and restart services
```

### Testing Commands
```bash
make dev-compile           # Send compile job to Saturn
make dev-execute           # Send execute job to Saturn
```

### Run Management
```bash
make dev-list-runs                  # List all test runs with info
make dev-view-run RUN_ID=<id>      # View logs for specific run
make dev-clean-runs                # Clean old runs (keeps latest 5)
```

### Container Access
```bash
make dev-shell-pubsub      # Open shell in Pub/Sub container
make dev-shell-saturn      # Open shell in Saturn container
make dev-pubsub-interactive # Interactive Pub/Sub client with rlwrap
```

### Utilities
```bash
make dev-clean             # Clean up containers and images
make help                 # Show all available commands
```

---

## Supported Languages

Saturn supports three language environments:

### Java 21 (Primary)
- **Scaffold:** battlecode25-scaffold (Java track)
- **Base Image:** Eclipse Temurin 21-jdk
- **JAVA_HOME:** `/opt/java/openjdk`
- **Test File:** `test-data/source/java21.zip`

### Java 8 (Legacy)
- **Scaffold:** Older battlecode scaffolds
- **Installation:** openjdk-8-jdk
- **JAVA_HOME:** `/usr/lib/jvm/java-8-openjdk-amd64`

### Python 3.12
- **Scaffold:** battlecode25-scaffold (Python track)
- **Installation:** Custom from python:3.12-slim-bookworm
- **Test File:** `test-data/source/py3.zip`

---

## Troubleshooting

### Services won't start
```bash
make dev-clean
make dev-build
make dev-docker-up
```

### Can't fetch secrets
```bash
gcloud auth login
gcloud config set project mitbattlecode
make dev-fetch-secret
```

### Code changes not showing
After modifying Saturn's Go source code:
```bash
make dev-docker-down
make dev-build
make dev-docker-up
```

### Job fails immediately
Check the logs:
```bash
make dev-docker-logs
# or
docker logs saturn-dev --tail 100
```

Common issues:
- Missing test data files in `test-data/source/`
- Incorrect package name in config
- Java path misconfiguration (should be `/opt/java/openjdk`)

### Pub/Sub messages not received
```bash
# Check if topic exists
make dev-shell-pubsub
./pubsubclient list-topics

# Check if subscription exists
docker exec saturn-pubsub-dev gcloud pubsub subscriptions list --project=mitbattlecode

# Recreate topic and subscription
./pubsubclient create-topic testing-saturn
./pubsubclient create-pull-subscription testing-saturn test
```

### Scaffold cloning fails
Ensure `development/secrets/secret.json` contains a valid GitHub token:
```bash
make dev-fetch-secret
cat development/secrets/secret.json
```

### Clean start from scratch
```bash
make dev-docker-down
make dev-clean
rm -rf development/runs/*
make dev-fetch-secret
make dev-build
make dev-docker-up
```

---

## Manual Setup (Without Make)

If you prefer not to use Make:

```bash
# 1. Fetch secrets
mkdir -p development/secrets
gcloud secrets versions access latest \
  --secret="production-saturn" \
  --project="mitbattlecode" \
  > development/secrets/secret.json

# 2. Build Docker images
cd development
docker-compose build

# 3. Start services
RUN_ID=$(date +%Y%m%d_%H%M%S)
mkdir -p runs/$RUN_ID/scaffolds runs/$RUN_ID/logs
echo $RUN_ID > runs/latest
SCAFFOLD_DIR=./runs/$RUN_ID/scaffolds docker-compose up -d

# 4. Send test jobs
# For compile:
docker exec saturn-pubsub-dev ./pubsubclient publish-json testing-saturn /development/configs/compile.template.json

# For execute:
docker exec saturn-pubsub-dev ./pubsubclient publish-json testing-saturn /development/configs/execute.template.json
```

---

## Production Deployment

Saturn runs on Google Cloud Run, triggered by Pub/Sub messages from the `saturn-compile` and `saturn-execute` topics.

### Environment Variables
- `PUBSUB_PROJECT_ID` - GCP project ID for Pub/Sub
- `SUBSCRIPTION_NAME` - Subscription to pull jobs from
- `GCS_BUCKET` - Google Cloud Storage bucket for artifacts
- `SATURN_REVISION` - Build revision for logging/monitoring

### Secrets
- GitHub personal access token (from Secret Manager) for cloning scaffolds

---

## Contributing

When making changes:

1. Test locally using the development environment
2. Ensure both compile and execute jobs work for all languages
3. Update this README if adding new features or changing workflow
4. Check logs for warnings or errors
5. Clean up test runs before committing: `make dev-clean-runs`

---

## Additional Resources

- [Battlecode 2025 Scaffold](https://github.com/battlecode/battlecode25-scaffold)
- [Google Cloud Pub/Sub Documentation](https://cloud.google.com/pubsub/docs)
- [Docker Compose Reference](https://docs.docker.com/compose/)
