package run

import (
	"context"

	"github.com/battlecode/galaxy/saturn/pkg/saturn"
	"github.com/go-git/go-git/v5"
	"github.com/rs/zerolog/log"
)

type Python3Scaffold struct {
	Scaffold
}

func NewPython3Scaffold(ctx context.Context, episode saturn.Episode, repo *git.Repository, root string) (*Python3Scaffold, error) {
	unsupported := &Step{
		Name: "Python 3 is not yet supported",
		Callable: func(ctx context.Context, arg *StepArguments) error {
			log.Ctx(ctx).Debug().Msgf("Python 3 is not yet supported.")
			arg.Finisher.Finish(saturn.TaskErrored, nil)
			return nil
		},
	}

	s := new(Python3Scaffold)
	s.root = root
	s.repo = repo
	s.compile = Recipe{unsupported}
	s.execute = Recipe{unsupported}
	return s, nil
}
