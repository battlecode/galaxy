package run

import (
	"context"

	"github.com/battlecode/galaxy/saturn/pkg/saturn"
	"github.com/rs/zerolog/log"
)

type Java8Scaffold struct {
	Scaffold
}

func NewJava8Scaffold(ctx context.Context, episode saturn.Episode, root string) (*Java8Scaffold, error) {
	unsupported := &Step{
		Name: "Java 8 is not yet supported",
		Callable: func(ctx context.Context, arg *StepArguments) error {
			log.Ctx(ctx).Debug().Msgf("Java 8 is not yet supported.")
			arg.Finisher.Finish(saturn.TaskErrored, nil)
			return nil
		},
	}

	s := new(Java8Scaffold)
	s.root = root
	s.compile = Recipe{unsupported}
	s.execute = Recipe{unsupported}
	return s, nil
}
