package main

import (
	"context"
	"flag"
	"fmt"
	"os"
	"os/signal"
	"path/filepath"
	"strconv"
	"sync"
	"time"

	"github.com/battlecode/galaxy/saturn/pkg/run"
	"github.com/battlecode/galaxy/saturn/pkg/saturn"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
	"golang.org/x/sys/unix"
)

var (
	gcpProjectID                *string = flag.String("project", os.Getenv("GCP_PROJECT"), "the project id on gcp")
	gcpSecretName               *string = flag.String("secret", "", "the name of the saturn secret")
	gcpPubsubSubscriptionID     *string = flag.String("subscription", "", "the name of the pubsub subscription")
	gcpTokenedReporterAudience  *string = flag.String("audience", "siarnaq", "the audience for gcp oidc tokens")
	gcpTokenedReporterUserAgent *string = flag.String("useragent", "Galaxy-Saturn", "the user agent for reporting")
	monitorPort                 *uint   = flag.Uint("port", 8005, "the port for monitoring shutdowns")
	scaffoldRoot                *string = flag.String("scaffold", "/scaffolds", "the root directory for saving scaffolds")
	parallelism                 *uint   = flag.Uint("parallel", 1, "the number of scaffolds to run in parallel")
	onSaturn                    *bool   = flag.Bool("onsaturn", true, "run on saturn")
)

func main() {
	zerolog.DefaultContextLogger = &log.Logger
	zerolog.LevelFieldName = "severity"
	zerolog.TimeFieldFormat = time.RFC3339Nano
	flag.Parse()

	ctx, stop := signal.NotifyContext(context.Background(), unix.SIGINT, unix.SIGTERM)
	defer stop()

	secret, err := saturn.ReadSecret(ctx, *gcpProjectID, *gcpSecretName, *onSaturn)
	if err != nil {
		log.Ctx(ctx).Fatal().Err(err).Msg("Could not read secrets.")
	}

	monitor, err := saturn.NewMonitor(fmt.Sprintf("127.0.0.1:%d", *monitorPort))
	if err != nil {
		log.Ctx(ctx).Fatal().Err(err).Msg("Could not initialize monitor.")
	}
	go monitor.Start()
	defer monitor.Close()
	ctx = monitor.WithContext(ctx)

	var (
		i  uint
		wg sync.WaitGroup
	)
	for i = 0; i < *parallelism; i++ {
		root := filepath.Join(*scaffoldRoot, strconv.FormatUint(uint64(i), 10))
		multiplexer, err := run.NewScaffoldMultiplexer(root, secret, *onSaturn)
		if err != nil {
			log.Ctx(ctx).Fatal().Err(err).Msg("Could not initialize scaffold multiplexer.")
		}

		app, err := saturn.New(
			ctx,
			saturn.WithGcpPubsubSubcriber(*gcpProjectID, *gcpPubsubSubscriptionID),
			saturn.WithGcpTokenedReporter(*gcpTokenedReporterAudience, *gcpTokenedReporterUserAgent),
			saturn.WithRunner("compile", multiplexer.Compile),
			saturn.WithRunner("execute", multiplexer.Execute),
		)
		if err != nil {
			log.Ctx(ctx).Fatal().Err(err).Msg("Could not initialize Saturn.")
		}

		wg.Add(1)
		go func() {
			defer wg.Done()
			if err := app.Start(ctx); err != nil {
				// TODO: log a traceback
				log.Ctx(ctx).Fatal().Err(err).Msg("System shut down abnormally.")
			}
		}()
	}

	wg.Wait()
	log.Ctx(ctx).Info().Msg("System shut down normally.")
}
