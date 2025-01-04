# Build go app
FROM golang:1.23.4-bookworm AS go

ENV BUILD_HOME /build
WORKDIR $BUILD_HOME

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -o /saturn -ldflags="-s -w" ./cmd/saturn/main.go

# Link intermediate container for python
FROM python:3.12-slim-bookworm as python

FROM openjdk:21-jdk-slim-bookworm

# Setup
RUN echo "deb http://deb.debian.org/debian unstable main" >> /etc/apt/sources.list && \
    apt-get update

# Install JDK8. The base image provides JDK21, but we still need JDK8 to
# run matches with java8
RUN apt-get install -y -t unstable openjdk-8-jdk

# Copy Python executable, libraries, standard library, site-packages, include files, binary files, and Python path
COPY --from=python /usr/local/bin/python3.12 /usr/local/bin/python3.12
COPY --from=python /usr/local/lib/libpython3.* /usr/local/lib/
COPY --from=python /usr/local/lib/python3.12 /usr/local/lib/python3.12
COPY --from=python /usr/local/include/python3.12 /usr/local/include/python3.12
COPY --from=python /usr/local/bin/pip* /usr/local/bin/
ENV PYTHONPATH=/usr/local/lib/python3.12:/usr/local/lib/python3.12/site-packages

ENV APP_HOME /app
WORKDIR $APP_HOME

ARG REVISION_ARG=nightly
ENV SATURN_REVISION=$REVISION_ARG

EXPOSE 8005

COPY --from=go /saturn .
ENTRYPOINT ["./saturn"]
