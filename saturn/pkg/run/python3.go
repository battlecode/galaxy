package run

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"strings"

	"github.com/battlecode/galaxy/saturn/pkg/saturn"
	"github.com/go-git/go-git/v5"
	"github.com/rs/zerolog/log"
)

type Python3Scaffold struct {
	Scaffold
	matchOutputs map[*StepArguments]string
	pyVersion    string
}

var pyWinnerRegex = regexp.MustCompile(`(?m)^\[server\]\s*.*\(([AB])\) wins \(round [0-9]+\)$`)

func NewPython3Scaffold(ctx context.Context, episode saturn.Episode, repo *git.Repository, root string, pyVersion string) (*Python3Scaffold, error) {
	s := new(Python3Scaffold)
	s.root = root
	s.repo = repo
	s.pyVersion = pyVersion
	s.compile = Recipe{
		&StateVersion,
		s.Prepare(),
		s.DownloadSource(),
		s.VerifySubmission(),
		s.CompileSucceeded(),
	}
	s.execute = Recipe{
		&StateVersion,
		s.Prepare(),
		s.DownloadBinaries(),
		s.RunMatch(),
		s.UploadReplay(),
		s.DetermineScores(),
	}
	s.matchOutputs = make(map[*StepArguments]string)
	return s, nil
}

func (s *Python3Scaffold) Prepare() *Step {
	return &Step{
		Name: "Prepare scaffold",
		Callable: func(ctx context.Context, arg *StepArguments) error {
			if err := s.Scaffold.Refresh(ctx); err != nil {
				return fmt.Errorf("Refresh: %v", err)
			}

			log.Ctx(ctx).Debug().Msg("Updating distribution.")
			out, err := s.Scaffold.RunCommand(
				ctx,
				[]string{},
				s.pyVersion,
				"update",
				fmt.Sprintf("--on-saturn=%t", true),
			)
			log.Ctx(ctx).Debug().Msg(out)
			if err != nil {
				return fmt.Errorf("RunCommand: %v", err)
			}
			return nil
		},
	}
}

func (s *Python3Scaffold) DownloadSource() *Step {
	return &Step{
		Name: "Download source code",
		Callable: func(ctx context.Context, arg *StepArguments) error {
			root := filepath.Join(s.Scaffold.root, "src")
			return GetArchive(ctx, arg.Finisher, arg.StorageClient, arg.Details.(CompileRequest).Source, root)
		},
	}
}

func (s *Python3Scaffold) DownloadBinaries() *Step {
	// Actually just downloading the source
	return &Step{
		Name: "Download binary",
		Callable: func(ctx context.Context, arg *StepArguments) error {
			submissions := map[string]Submission{
				"A": arg.Details.(ExecuteRequest).A,
				"B": arg.Details.(ExecuteRequest).B,
			}
			for k, v := range submissions {
				root := filepath.Join(s.Scaffold.root, "data", k)
				if err := GetArchive(ctx, arg.Finisher, arg.StorageClient, v.Source, root); err != nil {
					return err
				}
			}
			return nil
		},
	}
}

func (s *Python3Scaffold) UploadReplay() *Step {
	return &Step{
		Name: "Upload replay",
		Callable: func(ctx context.Context, arg *StepArguments) error {
			f, err := os.Open(filepath.Join(s.Scaffold.root, "data", "replay.bin"))
			if err != nil {
				return fmt.Errorf("os.Open: %v", err)
			}
			return arg.StorageClient.UploadFile(ctx, arg.Details.(ExecuteRequest).Replay, f, true)
		},
	}
}

func (s *Python3Scaffold) VerifySubmission() *Step {
	return &Step{
		Name: "Build source code",
		Callable: func(ctx context.Context, arg *StepArguments) error {
			pkg := arg.Details.(CompileRequest).Package
			if pkg == "" {
				log.Ctx(ctx).Debug().Msg("Package name must not be empty.")
				arg.Finisher.Finish(saturn.TaskCompleted, map[string]interface{}{
					"accepted": false,
				})
			}
			out, err := s.Scaffold.RunCommand(
				ctx,
				[]string{},
				s.pyVersion,
				"run.py",
				"verify",
				fmt.Sprintf("--p1=%s", pkg),
				fmt.Sprintf("--on-saturn=%t", true),
			)
			log.Ctx(ctx).Debug().Msg(out)
			if err != nil {
				arg.Finisher.Finish(saturn.TaskCompleted, map[string]interface{}{
					"accepted": false,
				})
			}
			return nil
		},
	}
}

func (s *Python3Scaffold) CompileSucceeded() *Step {
	return &Step{
		Name: "Compile succeeded",
		Callable: func(ctx context.Context, arg *StepArguments) error {
			arg.Finisher.Finish(saturn.TaskCompleted, map[string]interface{}{
				"accepted": true,
			})
			return nil
		},
	}
}

func (s *Python3Scaffold) RunMatch() *Step {
	return &Step{
		Name: "Run match",
		Callable: func(ctx context.Context, arg *StepArguments) error {
			out, err := s.Scaffold.RunCommand(
				ctx,
				[]string{},
				s.pyVersion,
				"run",
				fmt.Sprintf("--on-saturn=%t", true),
				fmt.Sprintf("--p1-team=%s", arg.Details.(ExecuteRequest).A.TeamName),
				fmt.Sprintf("--p2-team=%s", arg.Details.(ExecuteRequest).B.TeamName),
				fmt.Sprintf("--p1-dir=%s", filepath.Join("data", "A")),
				fmt.Sprintf("--p2-dir=%s", filepath.Join("data", "B")),
				fmt.Sprintf("--p1=%s", arg.Details.(ExecuteRequest).A.Package),
				fmt.Sprintf("--p2=%s", arg.Details.(ExecuteRequest).B.Package),
				fmt.Sprintf("--maps=%s", strings.Join(arg.Details.(ExecuteRequest).Maps, ",")),
				fmt.Sprintf("--out-file-dir=%s", "data"),
				fmt.Sprintf("--out-file-name=%s", "replay.bin"),
				fmt.Sprintf("--debug=%t", false),
				fmt.Sprintf("--show-indicators=%t", false),
			)
			log.Ctx(ctx).Debug().Msg(out)
			if err != nil {
				return fmt.Errorf("RunCommand: %v", err)
			}
			s.matchOutputs[arg] = out
			return nil
		},
	}
}

func (s *Python3Scaffold) DetermineScores() *Step {
	return &Step{
		Name: "Determine scores",
		Callable: func(ctx context.Context, arg *StepArguments) error {
			out, ok := s.matchOutputs[arg]
			if !ok {
				return fmt.Errorf("could not find match output")
			}
			defer delete(s.matchOutputs, arg)

			scores := []int{0, 0}
			for _, match := range pyWinnerRegex.FindAllSubmatch([]byte(out), -1) {
				if len(match) != 2 || len(match[1]) != 1 {
					return fmt.Errorf("could not determine winner: logs are unreadable")
				}
				switch match[1][0] {
				case 'A':
					scores[0] += 1
				case 'B':
					scores[1] += 1
				default:
					return fmt.Errorf("unknown winner: %c", match[1][0])
				}
			}
			arg.Finisher.Finish(saturn.TaskCompleted, map[string]interface{}{
				"scores": scores,
			})
			return nil
		},
	}
}
