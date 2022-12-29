package run

import (
	"context"
	"fmt"
	"path/filepath"

	"github.com/battlecode/galaxy/saturn/pkg/saturn"
	"github.com/go-git/go-git/v5"
	"github.com/mitchellh/mapstructure"
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
