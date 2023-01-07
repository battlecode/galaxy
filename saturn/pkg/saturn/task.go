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

func (s TaskStatus) Retryable() bool {
	switch s {
	case TaskErrored, TaskInterrupted:
		return true
	default:
		return false
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
	defer func(ctx context.Context) {
		switch r := recover(); r {
		case taskFinished{}, nil:
			log.Ctx(ctx).Info().Stringer("status", t.status).Msg("Task finished.")
		default:
			panic(r)
		}
		if err != nil {
			// TODO: log a traceback
		}
		if err = t.FinalizeReport(ctx, r); err != nil {
			err = fmt.Errorf("t.FinalizeReport: %v", err)
		}
		if t.status.Retryable() {
			err = fmt.Errorf("task not complete: %v", err)
		}
	}(ctx)
	defer t.Finish(TaskErrored, nil)

	if err = r.Report(ctx, t); err != nil {
		err = fmt.Errorf("r.Report: %v", err)
		return
	}

	hook := zerolog.HookFunc(func(e *zerolog.Event, level zerolog.Level, message string) {
		if _, err := t.logs.WriteString(message + "\n"); err != nil {
			panic(err)
		}
	})
	ctx = log.Ctx(ctx).Hook(hook).WithContext(ctx)
	if err = t.Runner(ctx, t, t.Payload); err != nil {
		err = fmt.Errorf("t.Runner: %v", err)
		return
	}
	return
}

func (t *Task) Finish(status TaskStatus, details map[string]interface{}) {
	if r := recover(); r != nil {
		panic(r) // Don't clobber an existing panic
	}
	if t.status != TaskRunning {
		return
	}
	t.status = status
	t.details = details
	panic(taskFinished{})
}

func (t *Task) FinalizeReport(ctx context.Context, r Reporter) error {
	if t.status == TaskAborted {
		return nil
	}
	if ctx.Err() != nil {
		t.status = TaskInterrupted
		log.Ctx(ctx).Debug().Msg("System: This task was interrupted and will be retried soon.\n")
	}
	if err := r.Report(ctx, t); err != nil {
		return fmt.Errorf("r.Report: %v", err)
	}
	return nil
}
