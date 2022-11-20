package titan

import (
	"context"
	"errors"
	"fmt"
	"net/http"

	cloudevents "github.com/cloudevents/sdk-go/v2"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

// EventArcTriggerType is the EventArc trigger type that this server should respond to.
const EventArcTriggerType = "google.cloud.storage.object.v1.metadataUpdated"

// EventPayload contains the details of the event delivered by EventArc.
type EventPayload struct {
	Bucket string `json:"bucket"`
	Name   string `json:"name"`
}

// WithLogger updates the logger context to include event payload details.
func (e *EventPayload) WithLogger(ctx context.Context) context.Context {
	log := log.Ctx(ctx).With().Str("bucket", e.Bucket).Str("name", e.Name).Logger()
	return log.WithContext(ctx)
}

// Titan is the main application that receives EventArc events from Google Cloud
// Storage, and sends them to clamd for scanning.
type Titan struct {
	storage StorageClient
	scanner Scanner
}

// New creates a new Titan application and initializes its client connections.
func New(ctx context.Context) (*Titan, error) {
	log.Ctx(ctx).Debug().Msg("Initializing storage client.")
	storage, err := NewGCSClient(ctx)
	if err != nil {
		return nil, fmt.Errorf("NewGCSClient: %v", err)
	}

	log.Ctx(ctx).Debug().Msg("Initializing file scanner.")
	scanner, err := NewClamdClient(ctx)
	if err != nil {
		return nil, fmt.Errorf("NewClamdClient: %v", err)
	}

	return &Titan{storage, scanner}, nil
}

// Start begins the HTTP server to receive EventArc events.
func (t *Titan) Start(ctx context.Context, addr string) error {
	p, err := cloudevents.NewHTTP()
	if err != nil {
		return fmt.Errorf("cloudevents.NewHTTP: %v", err)
	}

	h, err := cloudevents.NewHTTPReceiveHandler(ctx, p, t.Handle)
	if err != nil {
		return fmt.Errorf("cloudevents.NewHTTPReceiveHandler: %v", err)
	}

	err = http.ListenAndServe(addr, h)
	if err != nil && !errors.Is(err, http.ErrServerClosed) {
		return fmt.Errorf("http.ListenAndServe: %v", err)
	}
	return nil
}

// Handle responds to a single EventArc event.
func (t *Titan) Handle(ctx context.Context, event cloudevents.Event) error {
	fail := func(event *zerolog.Event, message string) error {
		event.Msg(message)
		return errors.New(message)
	}

	if t := event.Type(); t != EventArcTriggerType {
		return fail(log.Ctx(ctx).Warn().Str("eventType", t), "Unexpected event type.")
	}

	data := &EventPayload{}
	if err := event.DataAs(data); err != nil {
		return fail(log.Ctx(ctx).Warn().Err(err), "Failed to parse event payload.")
	}

	ctx = data.WithLogger(ctx)
	file, err := t.storage.GetFile(ctx, data)
	if err != nil {
		return fail(log.Ctx(ctx).Warn().Err(err), "Failed to retrieve file.")
	}
	return t.HandleFile(ctx, file)
}

// HandleFile scans a file, and updates its status to reflect the scanning outcome.
func (t *Titan) HandleFile(ctx context.Context, file File) error {
	log.Ctx(ctx).Debug().Msg("Received request to process file.")

	switch f := file.Status(); f {
	case TitanStatusUntracked:
		log.Ctx(ctx).Debug().Msg("File does not require scanning.")
		return nil

	case TitanStatusUnverified:
		log.Ctx(ctx).Info().Msg("Commencing malware scan for file.")

	default:
		log.Ctx(ctx).Debug().Msg("File has already been scanned.")
		return nil
	}

	signatures, err := t.scanner.Scan(ctx, file)
	if err != nil {
		return fmt.Errorf("scanner.Scan: %v", err)
	}

	var status FileStatus
	if len(signatures) > 0 {
		log.Ctx(ctx).Warn().Strs("signatures", signatures).Msg("File is malicious.")
		status = TitanStatusMalicious
	} else {
		log.Ctx(ctx).Info().Msg("No threats found.")
		status = TitanStatusVerified
	}

	if err := file.SetStatus(ctx, status); err != nil {
		return fmt.Errorf("file.SetStatus: %v", err)
	}
	return nil
}
