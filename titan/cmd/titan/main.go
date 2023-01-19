package main

import (
	"context"
	"os"
	"time"

	"github.com/battlecode/galaxy/titan/pkg/titan"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

func main() {
	zerolog.DefaultContextLogger = &log.Logger
	zerolog.LevelFieldName = "severity"
	zerolog.TimeFieldFormat = time.RFC3339Nano

	ctx := context.Background()

	titan, err := titan.New(ctx)
	if err != nil {
		log.Ctx(ctx).Fatal().Err(err).Msg("Could not initialize Titan.")
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Ctx(ctx).Info().Msgf("Listening on port %s.", port)

	if err := titan.Start(ctx, ":"+port); err != nil {
		log.Ctx(ctx).Fatal().Err(err).Msg("Server closed abnormally.")
	}
	log.Ctx(ctx).Info().Msg("Server closed normally.")
}
