package run

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"os/exec"
	"path/filepath"
	"strings"

	"github.com/battlecode/galaxy/saturn/pkg/saturn"
	"github.com/go-git/go-git/v5"
	"github.com/go-git/go-git/v5/plumbing/transport"
	transportHttp "github.com/go-git/go-git/v5/plumbing/transport/http"
	"github.com/mitchellh/mapstructure"
	"github.com/rs/zerolog/log"
)

type Submission struct {
	SourcePath string `mapstructure:"source-path"`
	BinaryPath string `mapstructure:"binary-path"`
	TeamName   string `mapstructure:"team-name"`
	Package    string `mapstructure:"package"`
}

type CompileRequest struct {
	Submission `mapstructure:"submission"`
}

type ExecuteRequest struct {
	A          Submission `mapstructure:"a"`
	B          Submission `mapstructure:"b"`
	ReplayPath string     `mapstructure:"replay-path"`
}

type ScaffoldMultiplexer struct {
	Root      string
	scaffolds map[string]*Scaffold
}

func NewScaffoldMultiplexer(root string) *ScaffoldMultiplexer {
	return &ScaffoldMultiplexer{
		Root:      root,
		scaffolds: make(map[string]*Scaffold),
	}
}

func (m *ScaffoldMultiplexer) runTask(
	ctx context.Context,
	payload saturn.TaskPayload,
	runner func(ctx context.Context, scaffold *Scaffold) error,
) (err error) {
	scaffold, ok := m.scaffolds[payload.Episode.Name]
	if !ok {
		root := filepath.Join(m.Root, payload.Episode.Name)
		scaffold, err = NewScaffold(ctx, payload.Episode, root)
		if err != nil {
			return
		}
		m.scaffolds[payload.Episode.Name] = scaffold
	}
	return runner(ctx, scaffold)
}

func (m *ScaffoldMultiplexer) Compile(
	ctx context.Context,
	f saturn.Finisher,
	payload saturn.TaskPayload,
) error {
	var req CompileRequest
	if err := mapstructure.Decode(payload.Details, &req); err != nil {
		return fmt.Errorf("mapstructure.Decode: %v", err)
	}
	storage, err := NewGCSClient(ctx)
	if err != nil {
		return fmt.Errorf("NewGCSClient: %v", err)
	}
	arg := &StepArguments{
		Details:       req,
		StorageClient: storage,
		Finisher:      f,
	}
	return m.runTask(ctx, payload, func(ctx context.Context, scaffold *Scaffold) error {
		return scaffold.compile.Run(ctx, arg)
	})
}

func (m *ScaffoldMultiplexer) Execute(
	ctx context.Context,
	f saturn.Finisher,
	payload saturn.TaskPayload,
) error {
	var req ExecuteRequest
	if err := mapstructure.Decode(payload.Details, &req); err != nil {
		return fmt.Errorf("mapstructure.Decode: %v", err)
	}
	storage, err := NewGCSClient(ctx)
	if err != nil {
		return fmt.Errorf("NewGCSClient: %v", err)
	}
	arg := &StepArguments{
		Details:       req,
		StorageClient: storage,
		Finisher:      f,
	}
	return m.runTask(ctx, payload, func(ctx context.Context, scaffold *Scaffold) error {
		return scaffold.execute.Run(ctx, arg)
	})
}

type Scaffold struct {
	root    string
	repo    *git.Repository
	compile Recipe
	execute Recipe
}

func NewScaffold(ctx context.Context, episode saturn.Episode, root string) (*Scaffold, error) {
	switch episode.Language {
	case saturn.Java8:
		s, err := NewJava8Scaffold(ctx, episode, root)
		if err != nil {
			return nil, fmt.Errorf("NewJava8Scaffold: %v", err)
		}
		return &s.Scaffold, nil
	case saturn.Python3:
		s, err := NewPython3Scaffold(ctx, episode, root)
		if err != nil {
			return nil, fmt.Errorf("NewPython3Scaffold: %v", err)
		}
		return &s.Scaffold, nil
	default:
		return nil, fmt.Errorf("no such language: %v", episode.Language)
	}
}

func (s *Scaffold) RunCommand(ctx context.Context, name string, arg ...string) (string, error) {
	log.Ctx(ctx).Debug().Msgf("Running command: %s %s", name, strings.Join(arg, " "))
	procOutput := new(bytes.Buffer)
	cmd := exec.CommandContext(ctx, name, arg...)
	cmd.Dir = s.root
	cmd.Stdout, cmd.Stderr = procOutput, procOutput
	err := cmd.Run()
	return procOutput.String(), err
}

func (s *Scaffold) Refresh(ctx context.Context) error {
	wt, err := s.repo.Worktree()
	if err != nil {
		return fmt.Errorf("repo.Worktree: %v", err)
	}

	log.Ctx(ctx).Debug().Msg("Resetting scaffold.")
	if err := wt.Reset(&git.ResetOptions{Mode: git.HardReset}); err != nil {
		return fmt.Errorf("wt.Reset: %v", err)
	}

	log.Ctx(ctx).Debug().Msg("Cleaning scaffold.")
	if err := wt.Clean(&git.CleanOptions{Dir: true}); err != nil {
		return fmt.Errorf("wt.Clean: %v", err)
	}

	auth, err := getGitAuth(ctx)
	if err != nil {
		return fmt.Errorf("getGitAuth: %v", err)
	}
	log.Ctx(ctx).Debug().Msg("Pulling scaffold.")
	switch err := wt.PullContext(ctx, &git.PullOptions{Auth: auth}); true {
	case err == nil:
		log.Ctx(ctx).Debug().Msg("New scaffold version downloaded.")
	case errors.Is(err, git.NoErrAlreadyUpToDate):
		log.Ctx(ctx).Debug().Msg("Already up to date.")
	default:
		return fmt.Errorf("wt.PullContext: %v", err)
	}
	return nil
}

func cloneGit(ctx context.Context, url, root string) (*git.Repository, error) {
	auth, err := getGitAuth(ctx)
	if err != nil {
		return nil, fmt.Errorf("getGitAuth: %v", err)
	}
	return git.PlainCloneContext(ctx, root, false, &git.CloneOptions{
		URL:  url,
		Auth: auth,
	})
}

func getGitAuth(ctx context.Context) (transport.AuthMethod, error) {
	return &transportHttp.BasicAuth{
		Username: "ignored",
		Password: "", // TODO!
	}, nil
}
