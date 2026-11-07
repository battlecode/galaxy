#!/bin/bash
set -euo pipefail

IMAGE=${image}
REGISTRY=${registry}
PROJECT=${project}
SECRET=${secret}
SUBSCRIPTION=${subscription}
PARALLELISM=${parallelism}
CONTAINER_NAME=saturn

exec >>/var/log/saturn-startup.log 2>&1

echo "Starting Saturn container at $(date -u +%Y-%m-%dT%H:%M:%SZ)"

until docker info >/dev/null 2>&1; do
  echo "Waiting for Docker..."
  sleep 2
done

until TOKEN_RESPONSE="$(curl --fail --silent --show-error \
  -H 'Metadata-Flavor: Google' \
  'http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token')"; do
  echo "Waiting for the metadata server..."
  sleep 2
done

ACCESS_TOKEN="$(printf '%s' "$TOKEN_RESPONSE" | sed -E 's/.*"access_token":"([^"]+)".*/\1/')"
if [ -z "$ACCESS_TOKEN" ] || [ "$ACCESS_TOKEN" = "$TOKEN_RESPONSE" ]; then
  echo "Unable to obtain an access token from the metadata server" >&2
  exit 1
fi

printf '%s' "$ACCESS_TOKEN" | docker login \
  --username oauth2accesstoken \
  --password-stdin "https://$REGISTRY"

docker rm --force "$CONTAINER_NAME" >/dev/null 2>&1 || true
docker pull "$IMAGE"
docker run \
  --detach \
  --name "$CONTAINER_NAME" \
  --restart on-failure \
  "$IMAGE" \
  "-project=$PROJECT" \
  "-secret=$SECRET" \
  "-subscription=$SUBSCRIPTION" \
  "-parallel=$PARALLELISM"

echo "Saturn container started at $(date -u +%Y-%m-%dT%H:%M:%SZ)"
