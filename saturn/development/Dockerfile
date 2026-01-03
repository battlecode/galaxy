# Use an official Golang image as a parent image
FROM golang:1.23

# Install Google Cloud SDK
RUN apt-get update && apt-get install -y curl gnupg rlwrap && \
    echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] http://packages.cloud.google.com/apt cloud-sdk main" | tee -a /etc/apt/sources.list.d/google-cloud-sdk.list && \
    curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key --keyring /usr/share/keyrings/cloud.google.gpg add - && \
    apt-get update && apt-get install -y google-cloud-sdk google-cloud-sdk-pubsub-emulator

# Install Pub/Sub emulator
RUN apt-get install google-cloud-cli-pubsub-emulator

# Set the working directory
WORKDIR /app

# Copy the Go application code
COPY . /app
RUN go mod download
RUN go build -o pubsubclient pubsubclient.go
# Expose the Pub/Sub emulator port
EXPOSE 8514

# Set Pub/Sub emulator environment variable
ENV PUBSUB_EMULATOR_HOST=0.0.0.0:8514

# Create startup script inline
RUN cat > /usr/local/bin/start.sh <<'EOF'
#!/bin/bash
set -e

# Start the Pub/Sub emulator in the background
# Filter out noisy HTTP/2 and connection warnings while keeping useful logs
gcloud beta emulators pubsub start \
  --project=mitbattlecode \
  --host-port=0.0.0.0:8514 \
  2>&1 &

EMULATOR_PID=$!

# Wait for the emulator to be ready
echo "Waiting for Pub/Sub emulator to start..."
sleep 5

# Set environment variable
export PUBSUB_EMULATOR_HOST=0.0.0.0:8514

# Create topic and subscription
echo "Creating topic and subscription..."
./pubsubclient create-topic testing-saturn
./pubsubclient create-pull-subscription testing-saturn test
echo "✓ Pub/Sub emulator is ready"

# Wait for the emulator process (keeps container alive and shows logs)
wait $EMULATOR_PID
EOF

RUN chmod +x /usr/local/bin/start.sh

# Run the startup script
ENTRYPOINT ["/usr/local/bin/start.sh"]
