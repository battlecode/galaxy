package saturn

import (
	"context"
	"errors"
	"fmt"
	"net"

	"github.com/rs/zerolog/log"
)

type Monitor struct {
	l    net.Listener
	stop chan struct{}
}

func NewMonitor(address string) (*Monitor, error) {
	log.Info().Msgf("Monitor listening for shutdown on %v.", address)
	l, err := net.Listen("tcp", address)
	if err != nil {
		return nil, fmt.Errorf("net.Listen: %v", err)
	}
	stop := make(chan struct{})
	monitor := &Monitor{l, stop}
	return monitor, nil
}

func (m *Monitor) Start() {
	defer func() {
		log.Info().Msg("Monitor shutting down.")
		close(m.stop)
	}()

	log.Info().Msg("Monitor waiting for incoming connection.")
	conn, err := m.l.Accept()
	if err != nil {
		if errors.Is(err, net.ErrClosed) {
			log.Info().Err(err).Msg("Ignoring monitor error as it has been closed.")
		} else {
			// TODO log traceback
			log.Error().Err(err).Msg("Monitor failed to accept a connection.")
		}
		return
	}
	log.Info().Msg("Monitor accepted a connection.")
	defer conn.Close()
}

func (m *Monitor) Close() error {
	log.Info().Msg("Closing monitor.")
	if err := m.l.Close(); err != nil {
		return fmt.Errorf("l.Close: %v", err)
	}
	return nil
}

func (m *Monitor) WithContext(ctx context.Context) context.Context {
	ctx, cancel := context.WithCancel(ctx)
	go func(ctx context.Context) {
		defer cancel()
		select {
		case <-m.stop:
			log.Ctx(ctx).Info().Msg("Cancelling context as monitor detected shutdown.")
		case <-ctx.Done():
			log.Ctx(ctx).Debug().Msg("Ignoring monitor as context was cancelled.")
		}
	}(ctx)
	return ctx
}
