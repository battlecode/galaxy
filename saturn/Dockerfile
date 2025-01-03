FROM golang:1.20.1-buster AS go

ENV BUILD_HOME /build
WORKDIR $BUILD_HOME

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -o /saturn -ldflags="-s -w" ./cmd/saturn/main.go


FROM openjdk:21-jdk-slim-buster

# Install JDK8. The base image provides JDK21, but we still need JDK8 to
# run matches with java8
RUN apt-get update; apt-get install -y openjdk-8-jdk

# Install python
RUN apt-get install -y software-properties-common && \
    add-apt-repository -y ppa:deadsnakes/ppa && \
    apt-get update && \
    apt install -y python3.12

ENV APP_HOME /app
WORKDIR $APP_HOME

ARG REVISION_ARG=nightly
ENV SATURN_REVISION=$REVISION_ARG

EXPOSE 8005

COPY --from=go /saturn .
ENTRYPOINT ["./saturn"]
