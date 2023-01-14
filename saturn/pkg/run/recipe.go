package run

import (
	"context"
	"fmt"
	"os"

	"github.com/battlecode/galaxy/saturn/pkg/saturn"
	"github.com/rs/zerolog/log"
)

type StepArguments struct {
	Details interface{}
	StorageClient
	saturn.Finisher
}

type Step struct {
	Name     string
	Callable func(ctx context.Context, arg *StepArguments) error
}

func (s *Step) Run(ctx context.Context, desc string, arg *StepArguments) error {
	log.Ctx(ctx).Debug().Msgf(">>> Starting %s: %s", desc, s.Name)
	defer log.Ctx(ctx).Debug().Msgf(">>> Ending %s\n", desc)
	return s.Callable(ctx, arg)
}

type Recipe []*Step

func (r Recipe) Run(ctx context.Context, arg *StepArguments) error {
	for i, step := range r {
		desc := fmt.Sprintf("step %d/%d", i+1, len(r))
		if err := step.Run(ctx, desc, arg); err != nil {
			log.Ctx(ctx).Warn().Err(err).Msgf("Step returned with an error: %v.", err)
			return fmt.Errorf("step.Run: %v", err)
		}
	}
	return nil
}

var StateVersion = Step{
	Name: "Hello world",
	Callable: func(ctx context.Context, arg *StepArguments) error {
		log.Ctx(ctx).Debug().Msg("Welcome to Saturn!")
		log.Ctx(ctx).Debug().Msgf("Node: %s", os.Getenv("HOSTNAME"))
		log.Ctx(ctx).Debug().Msgf("Revision: %s", os.Getenv("SATURN_REVISION"))
		return nil
	},
}
