#!/bin/sh

# Start the Pub/Sub emulator in the background
gcloud beta emulators pubsub start --project=mitbattlecode --host-port=127.0.0.1:8514 &

# Wait for the emulator to start
sleep 5

# set env variables
export PUBSUB_EMULATOR_HOST=127.0.0.1:8514

# create topic
./pubsubclient create-topic testing-saturn

# create pull subscription
./pubsubclient create-pull-subscription testing-saturn test

# to view all commands
./pubsubclient

# Keep the container running and accept more commands
while true; do
    echo "Enter a command to run (e.g., ./pubsubclient <command> <args>, all paths /development/...):"
    read -e -p "$ " cmd
    eval "$cmd"
done
