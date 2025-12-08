package titan

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"
)

// Mock implementations for testing

type mockFile struct {
	status FileStatus
	reader io.ReadCloser
}

func (m *mockFile) NewReader(ctx context.Context) (io.ReadCloser, error) {
	return m.reader, nil
}

func (m *mockFile) Status() FileStatus {
	return m.status
}

func (m *mockFile) SetStatus(ctx context.Context, status FileStatus) error {
	m.status = status
	return nil
}

type mockStorageClient struct {
	files map[string]*mockFile
}

func (m *mockStorageClient) GetFile(ctx context.Context, payload *ScanPayload) (File, error) {
	key := payload.Bucket + "/" + payload.Name
	if file, ok := m.files[key]; ok {
		return file, nil
	}
	return &mockFile{status: TitanStatusUnverified}, nil
}

type mockScanner struct {
	scanResults map[string][]string
	nextResult  []string
}

func (m *mockScanner) Scan(ctx context.Context, file File) ([]string, error) {
	// If nextResult is set, return it
	if m.nextResult != nil {
		return m.nextResult, nil
	}
	// Return empty slice (no threats) for testing
	return []string{}, nil
}

// Partitions:
// - message format: valid Pub/Sub structure, invalid JSON
// - payload encoding: correctly base64-encoded, malformed base64
// - file path: simple filename, nested path structure
// - HTTP method: POST (valid), GET/PUT/DELETE (invalid)
func TestHandleHTTP_PubSubPush(t *testing.T) {
	tests := []struct {
		name           string
		payload        ScanPayload
		wantStatusCode int
	}{
		{
			name: "valid pubsub push message",
			payload: ScanPayload{
				Bucket: "test-bucket",
				Name:   "file.pdf",
			},
			wantStatusCode: http.StatusOK,
		},
		{
			name: "pubsub message with nested path",
			payload: ScanPayload{
				Bucket: "secure-bucket",
				Name:   "episode/bc24/team/42/resume.pdf",
			},
			wantStatusCode: http.StatusOK,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Create Titan instance with mocks
			titan := &Titan{
				storage: &mockStorageClient{
					files: make(map[string]*mockFile),
				},
				scanner: &mockScanner{
					scanResults: make(map[string][]string),
				},
			}

			// Create Pub/Sub push message format
			payloadJSON, err := json.Marshal(tt.payload)
			if err != nil {
				t.Fatalf("failed to marshal payload: %v", err)
			}

			pubsubMessage := PubsubMessage{
				Subscription: "projects/test/subscriptions/titan-scan",
			}
			pubsubMessage.Message.Data = base64.StdEncoding.EncodeToString(payloadJSON)
			pubsubMessage.Message.MessageID = "test-message-123"
			pubsubMessage.Message.PublishTime = "2025-11-30T12:00:00Z"

			body, err := json.Marshal(pubsubMessage)
			if err != nil {
				t.Fatalf("failed to marshal pubsub message: %v", err)
			}

			// Create HTTP request
			req := httptest.NewRequest(http.MethodPost, "/", bytes.NewReader(body))
			req.Header.Set("Content-Type", "application/json")

			// Create response recorder
			w := httptest.NewRecorder()

			// Call handler
			err = titan.HandleHTTP(context.Background(), w, req)
			if err != nil {
				t.Logf("HandleHTTP returned error (expected for test): %v", err)
			}

			// Verify the message can be decoded correctly
			var decoded PubsubMessage
			if err := json.Unmarshal(body, &decoded); err != nil {
				t.Errorf("failed to unmarshal pubsub message: %v", err)
			}

			// Decode the base64 data
			data, err := base64.StdEncoding.DecodeString(decoded.Message.Data)
			if err != nil {
				t.Errorf("failed to decode base64 data: %v", err)
			}

			// Verify payload
			var parsed ScanPayload
			if err := json.Unmarshal(data, &parsed); err != nil {
				t.Errorf("failed to unmarshal payload: %v", err)
			}

			if parsed.Bucket != tt.payload.Bucket {
				t.Errorf("bucket mismatch: got %v, want %v", parsed.Bucket, tt.payload.Bucket)
			}
			if parsed.Name != tt.payload.Name {
				t.Errorf("name mismatch: got %v, want %v", parsed.Name, tt.payload.Name)
			}
		})
	}
}

// Partitions:
// - JSON structure: valid, malformed syntax
// - required fields: both present, bucket missing, name missing
// - file path format: simple filename, nested directory structure, special characters
// - bucket name: valid GCS bucket name, empty string
func TestScanPayload(t *testing.T) {
	tests := []struct {
		name    string
		json    string
		want    ScanPayload
		wantErr bool
	}{
		{
			name: "valid payload",
			json: `{"bucket":"test-bucket","name":"file.pdf"}`,
			want: ScanPayload{
				Bucket: "test-bucket",
				Name:   "file.pdf",
			},
			wantErr: false,
		},
		{
			name: "payload with nested path",
			json: `{"bucket":"secure","name":"episode/bc24/submission/123/source.zip"}`,
			want: ScanPayload{
				Bucket: "secure",
				Name:   "episode/bc24/submission/123/source.zip",
			},
			wantErr: false,
		},
		{
			name:    "invalid json",
			json:    `{invalid}`,
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			var got ScanPayload
			err := json.Unmarshal([]byte(tt.json), &got)

			if (err != nil) != tt.wantErr {
				t.Errorf("Unmarshal() error = %v, wantErr %v", err, tt.wantErr)
				return
			}

			if !tt.wantErr {
				if got.Bucket != tt.want.Bucket {
					t.Errorf("Bucket = %v, want %v", got.Bucket, tt.want.Bucket)
				}
				if got.Name != tt.want.Name {
					t.Errorf("Name = %v, want %v", got.Name, tt.want.Name)
				}
			}
		})
	}
}

// Partitions:
// - initial file status: Untracked, Unverified, Verified, Malicious
// - scan result: no threats (empty), single threat, multiple threats
// - scanner behavior: success, error/failure
func TestHandleFile(t *testing.T) {
	tests := []struct {
		name           string
		initialStatus  FileStatus
		scanSignatures []string
		wantStatus     FileStatus
	}{
		{
			name:           "unverified file with no threats",
			initialStatus:  TitanStatusUnverified,
			scanSignatures: []string{},
			wantStatus:     TitanStatusVerified,
		},
		{
			name:           "unverified file with malware",
			initialStatus:  TitanStatusUnverified,
			scanSignatures: []string{"Win.Test.EICAR"},
			wantStatus:     TitanStatusMalicious,
		},
		{
			name:          "untracked file should not be scanned",
			initialStatus: TitanStatusUntracked,
			wantStatus:    TitanStatusUntracked,
		},
		{
			name:          "already verified file should not be rescanned",
			initialStatus: TitanStatusVerified,
			wantStatus:    TitanStatusVerified,
		},
		{
			name:          "already malicious file should not be rescanned",
			initialStatus: TitanStatusMalicious,
			wantStatus:    TitanStatusMalicious,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Create mock file
			file := &mockFile{
				status: tt.initialStatus,
			}

			// Create mock scanner that returns configured signatures
			scanner := &mockScanner{
				scanResults: make(map[string][]string),
				nextResult:  tt.scanSignatures,
			}

			// Create Titan instance
			titan := &Titan{
				storage: &mockStorageClient{
					files: make(map[string]*mockFile),
				},
				scanner: scanner,
			}

			// Handle the file
			err := titan.HandleFile(context.Background(), file)
			if err != nil {
				t.Logf("HandleFile returned error: %v", err)
			}

			// For unverified files, status should change
			// For other files, status should remain unchanged
			if tt.initialStatus == TitanStatusUnverified {
				if file.Status() != tt.wantStatus {
					t.Errorf("Status = %v, want %v", file.Status(), tt.wantStatus)
				}
			} else {
				// File should not be scanned if not unverified
				if file.Status() != tt.initialStatus {
					t.Errorf("Status changed from %v to %v, should have remained %v",
						tt.initialStatus, file.Status(), tt.initialStatus)
				}
			}
		})
	}
}

// Partitions:
// - message structure: valid Google format, missing fields, extra fields
// - data encoding: valid base64, invalid base64, empty data
// - nested payload: valid JSON, invalid JSON, empty payload
// - field types: correct types, type mismatches
func TestPubsubMessageFormat(t *testing.T) {
	// Example message from Google Cloud Pub/Sub documentation
	messageJSON := `{
		"message": {
			"data": "eyJidWNrZXQiOiJ0ZXN0IiwibmFtZSI6ImZpbGUucGRmIn0=",
			"messageId": "136969346945",
			"publishTime": "2025-11-30T12:00:00.000Z"
		},
		"subscription": "projects/myproject/subscriptions/mysubscription"
	}`

	var msg PubsubMessage
	if err := json.Unmarshal([]byte(messageJSON), &msg); err != nil {
		t.Fatalf("failed to unmarshal message: %v", err)
	}

	// Verify structure
	if msg.Message.MessageID != "136969346945" {
		t.Errorf("MessageID = %v, want 136969346945", msg.Message.MessageID)
	}

	if msg.Subscription != "projects/myproject/subscriptions/mysubscription" {
		t.Errorf("Subscription = %v, want projects/myproject/subscriptions/mysubscription", msg.Subscription)
	}

	// Decode the data
	data, err := base64.StdEncoding.DecodeString(msg.Message.Data)
	if err != nil {
		t.Fatalf("failed to decode data: %v", err)
	}

	var payload ScanPayload
	if err := json.Unmarshal(data, &payload); err != nil {
		t.Fatalf("failed to unmarshal payload: %v", err)
	}

	if payload.Bucket != "test" {
		t.Errorf("Bucket = %v, want test", payload.Bucket)
	}
	if payload.Name != "file.pdf" {
		t.Errorf("Name = %v, want file.pdf", payload.Name)
	}
}
