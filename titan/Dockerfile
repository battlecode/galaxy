FROM golang:1.18-buster AS go

ENV BUILD_HOME /build
WORKDIR $BUILD_HOME

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -o /titan -ldflags="-s -w" ./cmd/titan/main.go


FROM clamav/clamav:0.105.1_base

ENV APP_HOME /app
WORKDIR $APP_HOME

ARG REVISION_ARG=nightly
ENV TITAN_REVISION=$REVISION_ARG

COPY --from=go /titan .
COPY bootstrap.sh .
ENTRYPOINT $APP_HOME/bootstrap.sh
