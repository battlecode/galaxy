package main

import (
	"context"
	"os/signal"

	"github.com/battlecode/galaxy/saturn/pkg/run"
	"github.com/battlecode/galaxy/saturn/pkg/saturn"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
	"golang.org/x/sys/unix"
)

const (
	gcpProjectId = "mitbattlecode"

	gcpSecretName = "staging-saturn"

	gcpPubsubSubscriptionId     = "staging-saturn-compile"
	gcpTokenedReporterAudience  = "siarnaq"
	gcpTokenedReporterUserAgent = "Galaxy-Saturn"
	monitorAddress              = "127.0.0.1:8005"

	scaffoldRoot = "/scaffolds"
)

func main() {
	zerolog.DefaultContextLogger = &log.Logger
	zerolog.LevelFieldName = "severity"

	ctx, stop := signal.NotifyContext(context.Background(), unix.SIGINT, unix.SIGTERM)
	defer stop()

	secret, err := saturn.ReadSecret(ctx, gcpProjectId, gcpSecretName)
	if err != nil {
		log.Ctx(ctx).Fatal().Err(err).Msg("Could not read secrets.")
	}

	multiplexer, err := run.NewScaffoldMultiplexer(scaffoldRoot, secret)
	if err != nil {
		log.Ctx(ctx).Fatal().Err(err).Msg("Could not initialize scaffold multiplexer.")
	}

	app, err := saturn.New(
		ctx,
		saturn.WithMonitor(monitorAddress),
		saturn.WithGcpPubsubSubcriber(gcpProjectId, gcpPubsubSubscriptionId),
		saturn.WithGcpTokenedReporter(gcpTokenedReporterAudience, gcpTokenedReporterUserAgent),
		saturn.WithRunner("compile", multiplexer.Compile),
		saturn.WithRunner("execute", multiplexer.Execute),
	)
	if err != nil {
		log.Ctx(ctx).Fatal().Err(err).Msg("Could not initialize Saturn.")
	}

	if err := app.Start(ctx); err != nil {
		// TODO: log a traceback
		log.Ctx(ctx).Fatal().Err(err).Msg("System shut down abnormally.")
	}
	log.Ctx(ctx).Info().Msg("System shut down normally.")
}
