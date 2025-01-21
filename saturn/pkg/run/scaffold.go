package run

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"os"
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

type ScaffoldMultiplexer struct {
	Root      string
	scaffolds map[string]*Scaffold
	gitAuth   transport.AuthMethod
	onSaturn  bool
}

func NewScaffoldMultiplexer(root string, secret *saturn.Secret, onSaturn bool) (*ScaffoldMultiplexer, error) {
	gitAuth := &transportHttp.BasicAuth{
		Username: "ignored",
		Password: secret.GitToken,
	}
	return &ScaffoldMultiplexer{
		Root:      root,
		scaffolds: make(map[string]*Scaffold),
		gitAuth:   gitAuth,
		onSaturn:  onSaturn,
	}, nil
}

func (m *ScaffoldMultiplexer) runTask(
	ctx context.Context,
	payload saturn.TaskPayload,
	runner func(ctx context.Context, scaffold *Scaffold) error,
) (err error) {
	var repo *git.Repository
	scaffold, ok := m.scaffolds[payload.Episode.Name]
	if !ok {
		root := filepath.Join(m.Root, payload.Episode.Name)
		repo, err = cloneGit(ctx, payload.Episode.Scaffold, root, m.gitAuth)
		if err != nil {
			return fmt.Errorf("cloneGit: %v", err)
		}
		scaffold, err = NewScaffold(ctx, payload.Episode, repo, root, m.onSaturn)
		if err != nil {
			return fmt.Errorf("NewScaffold: %v", err)
		}
		scaffold.gitAuth = m.gitAuth
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
	storage, err := NewGCSClient(ctx, m.onSaturn)
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
	storage, err := NewGCSClient(ctx, m.onSaturn)
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
	root     string
	repo     *git.Repository
	gitAuth  transport.AuthMethod
	compile  Recipe
	execute  Recipe
	onSaturn bool
}

func NewScaffold(ctx context.Context, episode saturn.Episode, repo *git.Repository, root string, onSaturn bool) (*Scaffold, error) {
	switch episode.Language {
	case saturn.Java8:
		// Kept for compatibility running old episodes
		s, err := NewJavaScaffold(ctx, episode, repo, root, "/usr/lib/jvm/java-8-openjdk-amd64", onSaturn)
		if err != nil {
			return nil, fmt.Errorf("NewJavaScaffold (Java8): %v", err)
		}
		return &s.Scaffold, nil
	case saturn.Java21:
		// Modern java21 scaffolds store java in the 'java' subdirectory of the scaffold
		javaRoot := filepath.Join(root, "java")
		s, err := NewJavaScaffold(ctx, episode, repo, javaRoot, "/usr/local/openjdk-21", onSaturn)
		if err != nil {
			return nil, fmt.Errorf("NewJavaScaffold (Java21): %v", err)
		}
		return &s.Scaffold, nil
	case saturn.Python3:
		pyRoot := filepath.Join(root, "python")
		s, err := NewPython3Scaffold(ctx, episode, repo, pyRoot, "python3.12", onSaturn)
		if err != nil {
			return nil, fmt.Errorf("NewPython3Scaffold: %v", err)
		}
		return &s.Scaffold, nil
	default:
		return nil, fmt.Errorf("no such language: %v", episode.Language)
	}
}

func (s *Scaffold) RunCommand(ctx context.Context, extra_env []string, name string, arg ...string) (string, error) {
	log.Ctx(ctx).Debug().Msgf("Running command: %s %s", name, strings.Join(arg, " "))
	procOutput := new(bytes.Buffer)
	cmd := exec.CommandContext(ctx, name, arg...)
	cmd.Dir = s.root
	cmd.Stdout, cmd.Stderr = procOutput, procOutput
	cmd.Env = os.Environ()
	cmd.Env = append(cmd.Env, extra_env...)
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

	log.Ctx(ctx).Debug().Msg("Pulling scaffold.")
	switch err := wt.PullContext(ctx, &git.PullOptions{Auth: s.gitAuth}); true {
	case err == nil:
		log.Ctx(ctx).Debug().Msg("> New scaffold version downloaded.")
	case errors.Is(err, git.NoErrAlreadyUpToDate):
		log.Ctx(ctx).Debug().Msg("> Already up to date.")
	default:
		return fmt.Errorf("wt.PullContext: %v", err)
	}
	return nil
}

func cloneGit(ctx context.Context, url, root string, auth transport.AuthMethod) (*git.Repository, error) {
	return git.PlainCloneContext(ctx, root, false, &git.CloneOptions{
		URL:  url,
		Auth: auth,
	})
}
