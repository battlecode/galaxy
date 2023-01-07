FROM golang:1.18-buster AS go

ENV BUILD_HOME /build
WORKDIR $BUILD_HOME

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -o /saturn -ldflags="-s -w" ./cmd/saturn/main.go


FROM openjdk:8-slim-buster

ENV APP_HOME /app
WORKDIR $APP_HOME

ARG REVISION_ARG=nightly
ENV REVISION=$REVISION_ARG

EXPOSE 8005

COPY --from=go /saturn .
ENTRYPOINT ["./saturn"]
