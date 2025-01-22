# Use an official Golang image as a parent image
FROM golang:1.23

# Install Google Cloud SDK
RUN apt-get update && apt-get install -y curl gnupg rlwrap && \
    echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] http://packages.cloud.google.com/apt cloud-sdk main" | tee -a /etc/apt/sources.list.d/google-cloud-sdk.list && \
    curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key --keyring /usr/share/keyrings/cloud.google.gpg add - && \
    apt-get update && apt-get install -y google-cloud-sdk google-cloud-sdk-pubsub-emulator

# Install Pub/Sub emulator
RUN apt-get install google-cloud-cli-pubsub-emulator

# Copy the start script
COPY startpubsub.sh /usr/local/bin/startpubsub.sh
RUN chmod +x /usr/local/bin/startpubsub.sh

# Set the working directory
WORKDIR /app

# Copy the Go application code
COPY . /app
RUN go mod download
RUN go build -o pubsubclient pubsubclient.go
# Expose the Pub/Sub emulator port
EXPOSE 8514

# Run the entry point script
ENTRYPOINT ["rlwrap", "/usr/local/bin/startpubsub.sh"]
