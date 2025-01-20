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

var javaWinnerRegex = regexp.MustCompile(`(?m)^\[server\]\s*.*\(([AB])\) wins \(round [0-9]+\)$`)

type JavaScaffold struct {
	Scaffold
	matchOutputs map[*StepArguments]string
	javaEnv      []string
}

func NewJavaScaffold(ctx context.Context, episode saturn.Episode, repo *git.Repository, root string, javaPath string, onSaturn bool) (*JavaScaffold, error) {
	s := new(JavaScaffold)
	s.root = root
	s.repo = repo
	s.javaEnv = []string{fmt.Sprintf("JAVA_HOME=%s", javaPath)}
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
	s.matchOutputs = make(map[*StepArguments]string)
	s.onSaturn = onSaturn
	return s, nil
}

func (s *JavaScaffold) Prepare() *Step {
	return &Step{
		Name: "Prepare scaffold",
		Callable: func(ctx context.Context, arg *StepArguments) error {
			if err := s.Scaffold.Refresh(ctx); err != nil {
				return fmt.Errorf("Refresh: %v", err)
			}

			log.Ctx(ctx).Debug().Msg("Flushing build directory.")
			if err := os.RemoveAll(filepath.Join(s.root, "build")); err != nil {
				return fmt.Errorf("os.RemoveAll: %v", err)
			}

			log.Ctx(ctx).Debug().Msg("Updating distribution.")
			out, err := s.Scaffold.RunCommand(
				ctx,
				s.javaEnv,
				"./gradlew",
				"update",
				fmt.Sprintf("-PonSaturn=%t", s.onSaturn),
			)
			log.Ctx(ctx).Debug().Msg(out)
			if err != nil {
				return fmt.Errorf("RunCommand: %v", err)
			}
			return nil
		},
	}
}

func (s *JavaScaffold) DownloadSource() *Step {
	return &Step{
		Name: "Download source code",
		Callable: func(ctx context.Context, arg *StepArguments) error {
			root := filepath.Join(s.Scaffold.root, "src")
			return GetArchive(ctx, arg.Finisher, arg.StorageClient, arg.Details.(CompileRequest).Source, root)
		},
	}
}

func (s *JavaScaffold) DownloadBinaries() *Step {
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

func (s *JavaScaffold) UploadBinary() *Step {
	return &Step{
		Name: "Upload binary",
		Callable: func(ctx context.Context, arg *StepArguments) error {
			root := filepath.Join(s.Scaffold.root, "build", "classes")
			return PutArchive(ctx, arg.Finisher, arg.StorageClient, arg.Details.(CompileRequest).Binary, root, false)
		},
	}
}

func (s *JavaScaffold) UploadReplay() *Step {
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

func (s *JavaScaffold) VerifySubmission() *Step {
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
				s.javaEnv,
				"./gradlew",
				"verify",
				fmt.Sprintf("-Pteam=%s", pkg),
				fmt.Sprintf("-PonSaturn=%t", s.onSaturn),
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

func (s *JavaScaffold) CompileSucceeded() *Step {
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

func (s *JavaScaffold) RunMatch() *Step {
	return &Step{
		Name: "Run match",
		Callable: func(ctx context.Context, arg *StepArguments) error {
			out, err := s.Scaffold.RunCommand(
				ctx,
				s.javaEnv,
				"./gradlew",
				"run",
				fmt.Sprintf("-PonSaturn=%t", s.onSaturn),
				fmt.Sprintf("-PteamA=%s", arg.Details.(ExecuteRequest).A.TeamName),
				fmt.Sprintf("-PteamB=%s", arg.Details.(ExecuteRequest).B.TeamName),
				fmt.Sprintf("-PclassLocationA=%s", filepath.Join("data", "A")),
				fmt.Sprintf("-PclassLocationB=%s", filepath.Join("data", "B")),
				fmt.Sprintf("-PpackageNameA=%s", arg.Details.(ExecuteRequest).A.Package),
				fmt.Sprintf("-PpackageNameB=%s", arg.Details.(ExecuteRequest).B.Package),
				fmt.Sprintf("-Pmaps=%s", strings.Join(arg.Details.(ExecuteRequest).Maps, ",")),
				fmt.Sprintf("-Preplay=%s", filepath.Join("data", "replay.bin")),
				fmt.Sprintf("-PalternateOrder=%t", arg.Details.(ExecuteRequest).AlternateOrder),
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

func (s *JavaScaffold) DetermineScores() *Step {
	return &Step{
		Name: "Determine scores",
		Callable: func(ctx context.Context, arg *StepArguments) error {
			out, ok := s.matchOutputs[arg]
			if !ok {
				return fmt.Errorf("could not find match output")
			}
			defer delete(s.matchOutputs, arg)

			scores := []int{0, 0}
			for _, match := range javaWinnerRegex.FindAllSubmatch([]byte(out), -1) {
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
