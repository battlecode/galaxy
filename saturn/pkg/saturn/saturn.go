package saturn

import (
	"context"
	"fmt"

	"github.com/rs/zerolog/log"
)

type Saturn struct {
	queue   QueueClient
	report  Reporter
	runners map[string]Runner
}

func New(ctx context.Context, options ...SaturnOption) (s *Saturn, err error) {
	s = &Saturn{
		runners: make(map[string]Runner),
	}
	for _, option := range options {
		s, err = option(ctx, s)
		if err != nil {
			return
		}
	}
	return
}

func (s *Saturn) Start(ctx context.Context) error {
	log.Ctx(ctx).Info().Msg("Starting server.")
	if err := s.queue.Subscribe(ctx, s.Handle); err != nil {
		return fmt.Errorf("queue.Subscribe: %v", err)
	}
	return nil
}

func (s *Saturn) Handle(ctx context.Context, payload TaskPayload) error {
	runner, ok := s.runners[payload.Metadata.TaskType]
	if !ok {
		return fmt.Errorf("no such task type: %v", payload.Metadata.TaskType)
	}
	task := &Task{
		Runner:  runner,
		Payload: payload,
	}
	if err := task.Run(ctx, s.report); err != nil {
		return fmt.Errorf("task.Run: %v", err)
	}
	return nil
}

type SaturnOption func(context.Context, *Saturn) (*Saturn, error)

func WithGcpPubsubSubcriber(projectID, subscriptionID string) SaturnOption {
	return func(ctx context.Context, s *Saturn) (*Saturn, error) {
		if s.queue != nil {
			return nil, fmt.Errorf("queue client already exists")
		}
		log.Ctx(ctx).Debug().Msg("Initializing queue subscriber.")
		queue, err := NewGCPPubsubSubscriber(ctx, projectID, subscriptionID)
		if err != nil {
			return nil, fmt.Errorf("NewGCPPubsubSubcriber: %v", err)
		}
		s.queue = queue
		return s, nil
	}
}

func WithGcpTokenedReporter(audience, userAgent string, onSaturn bool) SaturnOption {
	return func(ctx context.Context, s *Saturn) (*Saturn, error) {
		if s.report != nil {
			return nil, fmt.Errorf("reporter already exists")
		}
		log.Ctx(ctx).Debug().Msg("Initializing outcome reporter.")
		report, err := NewGCPTokenedReporter(ctx, audience, userAgent, onSaturn)
		if err != nil {
			return nil, fmt.Errorf("NewGCPTokenedReporter: %v", err)
		}
		s.report = report
		return s, nil
	}
}

func WithRunner(taskType string, runner Runner) SaturnOption {
	return func(ctx context.Context, s *Saturn) (*Saturn, error) {
		if _, ok := s.runners[taskType]; ok {
			return nil, fmt.Errorf("runner already exists: %v", taskType)
		}
		s.runners[taskType] = runner
		return s, nil
	}
}
