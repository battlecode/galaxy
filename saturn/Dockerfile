# Build go app
FROM golang:1.25-bookworm AS go

ENV BUILD_HOME /build
WORKDIR $BUILD_HOME

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -o /saturn -ldflags="-s -w" ./cmd/saturn/main.go

# Link intermediate container for python
FROM python:3.12-slim-bookworm as python

FROM eclipse-temurin:21-jdk

# Setup - Install JDK8 (base image provides JDK21)
# Add Ubuntu universe repository for openjdk-8
RUN apt-get update && \
  apt-get install -y software-properties-common && \
  add-apt-repository ppa:openjdk-r/ppa -y && \
  apt-get update && \
  apt-get install -y openjdk-8-jdk && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists/*

# Copy Python executable, libraries, standard library, site-packages, include files, binary files, and Python path
COPY --from=python /usr/local/bin/python3.12 /usr/local/bin/python3.12
COPY --from=python /usr/local/lib/libpython3.* /usr/local/lib/
COPY --from=python /usr/local/lib/python3.12 /usr/local/lib/python3.12
COPY --from=python /usr/local/include/python3.12 /usr/local/include/python3.12
COPY --from=python /usr/local/bin/pip* /usr/local/bin/
ENV PYTHONPATH=/usr/local/lib/python3.12:/usr/local/lib/python3.12/site-packages

# Install google cloud package for use in the scaffold
RUN python3.12 -m pip install google-cloud-storage

# Install Docker CLI for containerized execution
# Note: We only install the CLI, not the daemon. Saturn will use the host's Docker daemon via socket mounting.
RUN apt-get update && \
  apt-get install -y \
  ca-certificates \
  curl \
  gnupg && \
  install -m 0755 -d /etc/apt/keyrings && \
  curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg && \
  chmod a+r /etc/apt/keyrings/docker.gpg && \
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian bookworm stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null && \
  apt-get update && \
  apt-get install -y docker-ce-cli && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists/*

# Create battlecode user for running containerized tasks
# Use UID/GID 10000 to avoid conflicts with existing system users
RUN groupadd -g 10000 battlecode && \
  useradd -u 10000 -g battlecode -m -s /bin/bash battlecode

ENV APP_HOME /app
WORKDIR $APP_HOME

ARG REVISION_ARG=nightly
ENV SATURN_REVISION=$REVISION_ARG

EXPOSE 8005

COPY --from=go /saturn .
ENTRYPOINT ["./saturn"]
