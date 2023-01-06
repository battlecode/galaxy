package saturn

import (
	"bytes"
	"context"
	"fmt"

	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

type Runner func(context.Context, Finisher, TaskPayload) error

type Language string

const (
	Java8   Language = "java8"
	Python3 Language = "py3"
)

type Episode struct {
	Name     string   `json:"name"`
	Language Language `json:"language"`
	Scaffold string   `json:"scaffold"`
}

type TaskMetadata struct {
	ReportURL string `json:"report-url"`
	TaskType  string `json:"task-type"`
}

type TaskPayload struct {
	Episode  Episode                `json:"episode"`
	Metadata TaskMetadata           `json:"metadata"`
	Details  map[string]interface{} `json:"details"`
}

type TaskStatus uint8

const (
	TaskRunning TaskStatus = iota
	TaskCompleted
	TaskAborted
	TaskErrored
	TaskInterrupted
)

func (s TaskStatus) String() string {
	switch s {
	case TaskRunning:
		return "RUN"
	case TaskCompleted:
		return "OK!"
	case TaskErrored, TaskInterrupted:
		return "TRY"
	case TaskAborted:
		return "ABT"
	default:
		panic("Unexpected task status.")
	}
}

type taskFinished struct{}

type Finisher interface {
	Finish(status TaskStatus, details map[string]interface{})
}

type Task struct {
	Runner  Runner
	Payload TaskPayload
	status  TaskStatus
	details map[string]interface{}
	logs    bytes.Buffer
}

func (t *Task) Run(ctx context.Context, r Reporter) (err error) {
	defer func() {
		switch r := recover(); r {
		case taskFinished{}, nil:
			if err != nil {
				log.Ctx(ctx).Warn().Stringer("status", t.status).Err(err).Msg("Task did not finish successfully.")
			} else {
				log.Ctx(ctx).Info().Stringer("status", t.status).Msg("Task finished successfully.")
			}
		default:
			panic(r)
		}
		if tErr := t.FinalizeReport(ctx, r); tErr != nil {
			err = fmt.Errorf("t.FinalizeReport: %v", tErr)
		}
	}()
	defer t.Finish(TaskErrored, nil)

	hook := zerolog.HookFunc(func(e *zerolog.Event, level zerolog.Level, message string) {
		if _, err := t.logs.WriteString(message + "\n"); err != nil {
			panic(err)
		}
	})
	ctx = log.Ctx(ctx).Hook(hook).WithContext(ctx)

	log.Ctx(ctx).Debug().Msg("Initializing task.")
	if err = r.Report(ctx, t); err != nil {
		err = fmt.Errorf("r.Report: %v", err)
		return
	}

	log.Ctx(ctx).Debug().Msg("Running task.")
	if err = t.Runner(ctx, t, t.Payload); err != nil {
		err = fmt.Errorf("t.Runner: %v", err)
		return
	}
	return
}

func (t *Task) Finish(status TaskStatus, details map[string]interface{}) {
	if t.status != TaskRunning {
		t.status = status
		t.details = details
		panic(taskFinished{})
	}
}

func (t *Task) FinalizeReport(ctx context.Context, r Reporter) error {
	if t.status == TaskAborted {
		return nil
	}
	if ctx.Err() != nil {
		t.status = TaskInterrupted
	}
	if err := r.Report(ctx, t); err != nil {
		return fmt.Errorf("r.Report: %v", err)
	}
	return nil
}
