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
	Root           string
	scaffolds      map[string]*Scaffold
	gitAuth        transport.AuthMethod
	onSaturn       bool
	executionImage string
}

func NewScaffoldMultiplexer(root string, secret *saturn.Secret, onSaturn bool, executionImage string) (*ScaffoldMultiplexer, error) {
	gitAuth := &transportHttp.BasicAuth{
		Username: "ignored",
		Password: secret.GitToken,
	}
	return &ScaffoldMultiplexer{
		Root:           root,
		scaffolds:      make(map[string]*Scaffold),
		gitAuth:        gitAuth,
		onSaturn:       onSaturn,
		executionImage: executionImage,
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
		scaffold, err = NewScaffold(ctx, payload.Episode, repo, root, m.onSaturn, m.executionImage)
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

	// Container fields for isolated execution
	containerRuntime ContainerRuntime
	containerID      string
	executionImage   string
}

func NewScaffold(ctx context.Context, episode saturn.Episode, repo *git.Repository, root string, onSaturn bool, executionImage string) (*Scaffold, error) {
	var scaffold *Scaffold

	switch episode.Language {
	case saturn.Java8:
		// Kept for compatibility running old episodes
		s, err := NewJavaScaffold(ctx, episode, repo, root, "/usr/lib/jvm/java-8-openjdk-amd64", onSaturn, executionImage)
		if err != nil {
			return nil, fmt.Errorf("NewJavaScaffold (Java8): %v", err)
		}
		scaffold = &s.Scaffold
	case saturn.Java21:
		// Modern java21 scaffolds store java in the 'java' subdirectory of the scaffold
		javaRoot := filepath.Join(root, "java")
		s, err := NewJavaScaffold(ctx, episode, repo, javaRoot, "/opt/java/openjdk", onSaturn, executionImage)
		if err != nil {
			return nil, fmt.Errorf("NewJavaScaffold (Java21): %v", err)
		}
		scaffold = &s.Scaffold
	case saturn.Python3:
		pyRoot := filepath.Join(root, "python")
		s, err := NewPython3Scaffold(ctx, episode, repo, pyRoot, "python3.12", onSaturn, executionImage)
		if err != nil {
			return nil, fmt.Errorf("NewPython3Scaffold: %v", err)
		}
		scaffold = &s.Scaffold
	default:
		return nil, fmt.Errorf("no such language: %v", episode.Language)
	}

	scaffold.executionImage = executionImage

	log.Ctx(ctx).Info().Msg("Initializing Docker runtime for containerized execution")
	runtime, err := NewDockerRuntime(ctx)
	if err != nil {
		log.Ctx(ctx).Error().Err(err).Msg("Failed to initialize Docker runtime - containerized execution is required")
		return nil, fmt.Errorf("failed to initialize Docker runtime: %w", err)
	}

	scaffold.containerRuntime = runtime
	log.Ctx(ctx).Info().Msg("Docker runtime initialized successfully")

	return scaffold, nil
}

// RunCommand runs a command directly on the host
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

// RunIsolatedCommand runs a command in an isolated container
func (s *Scaffold) RunIsolatedCommand(ctx context.Context, extra_env []string, name string, arg ...string) (string, error) {
	if s.containerID == "" {
		if err := s.initContainer(ctx); err != nil {
			return "", fmt.Errorf("failed to initialize container: %w", err)
		}
	}

	output, err := s.containerRuntime.ExecCommand(ctx, s.containerID, extra_env, name, arg...)
	return output, err
}

func (s *Scaffold) initContainer(ctx context.Context) error {
	if s.containerID != "" {
		return nil
	}

	log.Ctx(ctx).Info().Msg("Initializing execution container")

	// When Saturn runs in Docker, it sees container paths that need to be translated to host paths
	scaffoldHostPath := s.translateToHostPath(s.root)

	config := &ContainerConfig{
		Image:          s.executionImage,
		onSaturn:       s.onSaturn,
		WorkDir:        "/workspace",
		NetworkMode:    "host",
		CPULimit:       2.0,
		MemoryLimit:    4 * 1024 * 1024 * 1024, // 4GB
		ReadOnlyRootFS: true,
		Mounts: []string{
			fmt.Sprintf("%s:/workspace:rw", scaffoldHostPath),
		},
		CapabilitiesToDrop: []string{"ALL"},
		CapabilitiesToAdd:  []string{"CHOWN", "SETUID", "SETGID", "DAC_OVERRIDE"},
		User:               "battlecode", // Run as non-root user
		Env:                append(os.Environ(), "GRADLE_USER_HOME=/tmp/.gradle"),
		Entrypoint:         []string{}, // Override image's ENTRYPOINT (./saturn) to allow exec commands
	}

	containerID, err := s.containerRuntime.CreateContainer(ctx, config)
	if err != nil {
		return fmt.Errorf("failed to create container: %w", err)
	}
	s.containerID = containerID

	if err := s.containerRuntime.StartContainer(ctx, containerID); err != nil {
		s.cleanupContainer(ctx)
		return fmt.Errorf("failed to start container: %w", err)
	}

	log.Ctx(ctx).Info().
		Str("container_id", containerID[:12]).
		Str("scaffold_root", s.root).
		Str("host_path", scaffoldHostPath).
		Msg("Execution container started")

	return nil
}

// translateToHostPath translates container paths to host paths for Docker-in-Docker.
func (s *Scaffold) translateToHostPath(containerPath string) string {
	containerBasePath := os.Getenv("SCAFFOLD_CONTAINER_PATH")
	hostBasePath := os.Getenv("SCAFFOLD_HOST_PATH")

	if containerBasePath == "" || hostBasePath == "" {
		log.Fatal().
			Str("SCAFFOLD_CONTAINER_PATH", containerBasePath).
			Str("SCAFFOLD_HOST_PATH", hostBasePath).
			Msg("Missing required environment variables for Docker-in-Docker path translation")
	}

	relativePath := strings.TrimPrefix(containerPath, containerBasePath)
	hostPath := filepath.Join(hostBasePath, relativePath)

	log.Debug().
		Str("container_path", containerPath).
		Str("host_path", hostPath).
		Msg("Translated path for Docker-in-Docker")

	return hostPath
}

func (s *Scaffold) cleanupContainer(ctx context.Context) {
	if s.containerID == "" {
		return
	}

	log.Ctx(ctx).Debug().
		Str("container_id", s.containerID[:12]).
		Msg("Cleaning up container")

	if err := s.containerRuntime.StopContainer(ctx, s.containerID, 10); err != nil {
		log.Ctx(ctx).Warn().Err(err).Msg("Failed to stop container")
	}

	if err := s.containerRuntime.RemoveContainer(ctx, s.containerID); err != nil {
		log.Ctx(ctx).Warn().Err(err).Msg("Failed to remove container")
	}

	s.containerID = ""
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
