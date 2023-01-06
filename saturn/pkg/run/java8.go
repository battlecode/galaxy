package run

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"regexp"

	"github.com/battlecode/galaxy/saturn/pkg/saturn"
	"github.com/go-git/go-git/v5"
	"github.com/rs/zerolog/log"
)

var java8WinnerRegex = regexp.MustCompile(`(?m)^\[server\]\s*.*\(([AB])\) wins \(round [0-9]+\)$`)

type Java8Scaffold struct {
	Scaffold
	matchOutputs map[*StepArguments]string
}

func NewJava8Scaffold(ctx context.Context, episode saturn.Episode, repo *git.Repository, root string) (*Java8Scaffold, error) {
	s := new(Java8Scaffold)
	s.root = root
	s.repo = repo
	s.compile = Recipe{
		&StateVersion,
		s.Prepare(),
		s.DownloadSource(),
		s.VerifySubmission(),
		s.UploadBinary(),
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
	return s, nil
}

func (s *Java8Scaffold) Prepare() *Step {
	return &Step{
		Name: "Prepare scaffold",
		Callable: func(ctx context.Context, arg *StepArguments) error {
			if err := s.Scaffold.Refresh(ctx); err != nil {
				return fmt.Errorf("Refresh: %v", err)
			}

			log.Ctx(ctx).Debug().Msg("Updating distribution.")
			out, err := s.Scaffold.RunCommand(
				ctx,
				"./gradlew",
				"update",
				fmt.Sprintf("-PonSaturn=%t", true),
			)
			log.Ctx(ctx).Debug().Msg(out)
			if err != nil {
				return fmt.Errorf("RunCommand: %v", err)
			}
			return nil
		},
	}
}

func (s *Java8Scaffold) DownloadSource() *Step {
	return &Step{
		Name: "Download source code",
		Callable: func(ctx context.Context, arg *StepArguments) error {
			root := filepath.Join(s.Scaffold.root, "src")
			return GetArchive(ctx, arg.Finisher, arg.StorageClient, arg.Details.(CompileRequest).Source, root)
		},
	}
}

func (s *Java8Scaffold) DownloadBinaries() *Step {
	return &Step{
		Name: "Download binary",
		Callable: func(ctx context.Context, arg *StepArguments) error {
			submissions := map[string]Submission{
				"A": arg.Details.(ExecuteRequest).A,
				"B": arg.Details.(ExecuteRequest).B,
			}
			for k, v := range submissions {
				root := filepath.Join(s.Scaffold.root, "data", k)
				if err := GetArchive(ctx, arg.Finisher, arg.StorageClient, v.Binary, root); err != nil {
					return err
				}
			}
			return nil
		},
	}
}

func (s *Java8Scaffold) UploadBinary() *Step {
	return &Step{
		Name: "Upload binary",
		Callable: func(ctx context.Context, arg *StepArguments) error {
			root := filepath.Join(s.Scaffold.root, "build", "classes")
			return PutArchive(ctx, arg.Finisher, arg.StorageClient, arg.Details.(CompileRequest).Binary, root)
		},
	}
}

func (s *Java8Scaffold) UploadReplay() *Step {
	return &Step{
		Name: "Upload replay",
		Callable: func(ctx context.Context, arg *StepArguments) error {
			f, err := os.Open(filepath.Join(s.Scaffold.root, "data", "replay.bin"))
			if err != nil {
				return fmt.Errorf("os.Open: %v", err)
			}
			return arg.StorageClient.UploadFile(ctx, arg.Details.(ExecuteRequest).Replay, f)
		},
	}
}

func (s *Java8Scaffold) VerifySubmission() *Step {
	return &Step{
		Name: "Build source code",
		Callable: func(ctx context.Context, arg *StepArguments) error {
			out, err := s.Scaffold.RunCommand(
				ctx,
				"./gradlew",
				"verify",
				fmt.Sprintf("-Pteam=%s", arg.Details.(CompileRequest).Package),
				fmt.Sprintf("-PonSaturn=%t", true),
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

func (s *Java8Scaffold) CompileSucceeded() *Step {
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

func (s *Java8Scaffold) RunMatch() *Step {
	return &Step{
		Name: "Run match",
		Callable: func(ctx context.Context, arg *StepArguments) error {
			out, err := s.Scaffold.RunCommand(
				ctx,
				"./gradlew",
				"run",
				fmt.Sprintf("-PonSaturn=%t", true),
				fmt.Sprintf("-PteamA=%s", arg.Details.(ExecuteRequest).A.TeamName),
				fmt.Sprintf("-PteamB=%s", arg.Details.(ExecuteRequest).B.TeamName),
				fmt.Sprintf("-PclassLocationA=%s", filepath.Join("data", "A")),
				fmt.Sprintf("-PclassLocationB=%s", filepath.Join("data", "B")),
				fmt.Sprintf("-PpackageNameA=%s", arg.Details.(ExecuteRequest).A.Package),
				fmt.Sprintf("-PpackageNameB=%s", arg.Details.(ExecuteRequest).B.Package),
				fmt.Sprintf("-Preplay=%s", filepath.Join("data", "replay.bin")),
				fmt.Sprintf("-PoutputVerbose=%t", false),
				fmt.Sprintf("-PshowIndicators=%t", false),
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

func (s *Java8Scaffold) DetermineScores() *Step {
	return &Step{
		Name: "Determine scores",
		Callable: func(ctx context.Context, arg *StepArguments) error {
			out, ok := s.matchOutputs[arg]
			if !ok {
				return fmt.Errorf("could not find match output")
			}
			defer delete(s.matchOutputs, arg)

			scores := []int{0, 0}
			for _, match := range java8WinnerRegex.FindAllSubmatch([]byte(out), -1) {
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
