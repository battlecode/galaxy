package titan

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"

	"github.com/rs/zerolog/log"
)

// PubsubMessage represents the structure of a Pub/Sub push message.
type PubsubMessage struct {
	Message struct {
		Data        string `json:"data"`
		MessageID   string `json:"messageId"`
		PublishTime string `json:"publishTime"`
	} `json:"message"`
	Subscription string `json:"subscription"`
}

// ScanPayload contains the details of a scan request published by Siarnaq.
type ScanPayload struct {
	Bucket string `json:"bucket"`
	Name   string `json:"name"`
}

// WithLogger updates the logger context to include scan payload details.
func (s *ScanPayload) WithLogger(ctx context.Context) context.Context {
	log := log.Ctx(ctx).With().Str("bucket", s.Bucket).Str("name", s.Name).Logger()
	return log.WithContext(ctx)
}

// Titan is the main application that receives Pub/Sub push messages from Siarnaq
// and sends files to clamd for scanning.
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

// Start begins the HTTP server to receive Pub/Sub push messages.
func (t *Titan) Start(ctx context.Context, addr string) error {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if err := t.HandleHTTP(r.Context(), w, r); err != nil {
			log.Ctx(r.Context()).Error().Err(err).Msg("Failed to handle request.")
			// Always return 200 to prevent Pub/Sub from retrying (we don't want retries)
			w.WriteHeader(http.StatusOK)
			return
		}
		w.WriteHeader(http.StatusOK)
	})

	err := http.ListenAndServe(addr, nil)
	if err != nil && !errors.Is(err, http.ErrServerClosed) {
		return fmt.Errorf("http.ListenAndServe: %v", err)
	}
	return nil
}

// HandleHTTP processes an HTTP request from Pub/Sub push subscription.
func (t *Titan) HandleHTTP(ctx context.Context, w http.ResponseWriter, r *http.Request) error {
	if r.Method != http.MethodPost {
		log.Ctx(ctx).Warn().Str("method", r.Method).Msg("Unexpected HTTP method.")
		return fmt.Errorf("unexpected method: %s", r.Method)
	}

	body, err := io.ReadAll(r.Body)
	if err != nil {
		log.Ctx(ctx).Warn().Err(err).Msg("Failed to read request body.")
		return fmt.Errorf("io.ReadAll: %v", err)
	}

	var pubsubMsg PubsubMessage
	if err := json.Unmarshal(body, &pubsubMsg); err != nil {
		log.Ctx(ctx).Warn().Err(err).Msg("Failed to parse Pub/Sub message.")
		return fmt.Errorf("json.Unmarshal: %v", err)
	}

	// Decode base64-encoded message data
	data, err := base64.StdEncoding.DecodeString(pubsubMsg.Message.Data)
	if err != nil {
		log.Ctx(ctx).Warn().Err(err).Msg("Failed to decode message data.")
		return fmt.Errorf("base64.DecodeString: %v", err)
	}

	var payload ScanPayload
	if err := json.Unmarshal(data, &payload); err != nil {
		log.Ctx(ctx).Warn().Err(err).Msg("Failed to parse scan payload.")
		return fmt.Errorf("json.Unmarshal payload: %v", err)
	}

	ctx = payload.WithLogger(ctx)
	log.Ctx(ctx).Debug().Str("messageId", pubsubMsg.Message.MessageID).Msg("Received scan request.")

	file, err := t.storage.GetFile(ctx, &payload)
	if err != nil {
		log.Ctx(ctx).Warn().Err(err).Msg("Failed to retrieve file.")
		return fmt.Errorf("storage.GetFile: %v", err)
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
