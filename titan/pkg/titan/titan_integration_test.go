package titan

import (
	"bytes"
	"context"
	"io"
	"os"
	"os/exec"
	"strings"
	"testing"
	"time"
)

// Integration tests that use actual ClamAV daemon.
// Run with: go test -v -tags=integration ./pkg/...
// Or skip with regular: go test ./pkg/...

// testFile implements the File interface for testing
type testFile struct {
	content []byte
	status  FileStatus
}

func (f *testFile) NewReader(ctx context.Context) (io.ReadCloser, error) {
	return io.NopCloser(bytes.NewReader(f.content)), nil
}

func (f *testFile) Status() FileStatus {
	return f.status
}

func (f *testFile) SetStatus(ctx context.Context, status FileStatus) error {
	f.status = status
	return nil
}

// setupClamD starts a clamd daemon for testing and returns a cleanup function.
// It waits for clamd to be ready before returning.
func setupClamD(t *testing.T) func() {
	t.Helper()

	requireClamd := os.Getenv("REQUIRE_CLAMD") == "true"

	// Check if clamd is already running
	if isClamdRunning() {
		t.Log("Using existing clamd instance")
		return func() {} // No cleanup needed
	}

	// In CI, clamd should already be running - if not, fail immediately
	if requireClamd {
		t.Fatal("clamd is not running (required in CI - check CI setup step)")
	}

	t.Log("clamd not found running, attempting to start locally...")

	// Try to start clamd locally (for local development)
	cmd := exec.Command("clamd")
	if err := cmd.Start(); err != nil {
		t.Skipf("Cannot start clamd (install clamav-daemon): %v", err)
	}

	// Wait for clamd to be ready (up to 30 seconds for local environments)
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	ready := make(chan bool)
	go func() {
		for {
			if isClamdRunning() {
				ready <- true
				return
			}
			select {
			case <-ctx.Done():
				return
			case <-time.After(500 * time.Millisecond):
				// Continue waiting
			}
		}
	}()

	select {
	case <-ready:
		t.Log("clamd started successfully")
	case <-ctx.Done():
		if cmd.Process != nil {
			cmd.Process.Kill()
		}
		t.Skip("clamd did not start in time")
	}

	return func() {
		if cmd.Process != nil {
			cmd.Process.Kill()
		}
	}
}

// isClamdRunning checks if clamd is responding
func isClamdRunning() bool {
	client, err := NewClamdClient(context.Background())
	if err != nil {
		return false
	}
	// Try to ping clamd to test connectivity
	_, err = client.client.Ping(context.Background())
	return err == nil
}

// TestClamdIntegration_CleanFile tests scanning a clean file with actual clamd
func TestClamdIntegration_CleanFile(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping integration test in short mode")
	}

	cleanup := setupClamD(t)
	defer cleanup()

	ctx := context.Background()

	// Create a clamd client
	scanner, err := NewClamdClient(ctx)
	if err != nil {
		t.Fatalf("Failed to create clamd client: %v", err)
	}

	// Create a clean test file
	cleanContent := []byte("This is a clean test file with no malware.")
	file := &testFile{
		content: cleanContent,
		status:  TitanStatusUnverified,
	}

	// Scan the file
	signatures, err := scanner.Scan(ctx, file)
	if err != nil {
		t.Fatalf("Scan failed: %v", err)
	}

	// Should find no threats
	if len(signatures) != 0 {
		t.Errorf("Expected no threats, but found: %v", signatures)
	}
}

// TestClamdIntegration_EICARTestFile tests scanning the EICAR test file
// EICAR is a standard test file that all antivirus software should detect
func TestClamdIntegration_EICARTestFile(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping integration test in short mode")
	}

	cleanup := setupClamD(t)
	defer cleanup()

	ctx := context.Background()

	// Create a clamd client
	scanner, err := NewClamdClient(ctx)
	if err != nil {
		t.Fatalf("Failed to create clamd client: %v", err)
	}

	// EICAR test string - standard test file for antivirus software
	// This is NOT actual malware, just a test pattern
	eicarString := "X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*"
	file := &testFile{
		content: []byte(eicarString),
		status:  TitanStatusUnverified,
	}

	// Scan the file
	signatures, err := scanner.Scan(ctx, file)
	if err != nil {
		t.Fatalf("Scan failed: %v", err)
	}

	// Should detect the EICAR test file
	if len(signatures) == 0 {
		t.Error("Expected EICAR test file to be detected, but no threats found")
	} else {
		t.Logf("Detected signatures: %v", signatures)
		// Check that it found something related to EICAR
		foundEICAR := false
		for _, sig := range signatures {
			if strings.Contains(strings.ToUpper(sig), "EICAR") {
				foundEICAR = true
				break
			}
		}
		if !foundEICAR {
			t.Errorf("Expected EICAR signature, but got: %v", signatures)
		}
	}
}

// TestTitanIntegration_HandleFileWithClamD tests the full HandleFile workflow
func TestTitanIntegration_HandleFileWithClamD(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping integration test in short mode")
	}

	cleanup := setupClamD(t)
	defer cleanup()

	ctx := context.Background()

	// Create a real scanner
	scanner, err := NewClamdClient(ctx)
	if err != nil {
		t.Fatalf("Failed to create clamd client: %v", err)
	}

	// Create Titan with mock storage but real scanner
	titan := &Titan{
		storage: &mockStorageClient{
			files: make(map[string]*mockFile),
		},
		scanner: scanner,
	}

	tests := []struct {
		name           string
		fileContent    []byte
		initialStatus  FileStatus
		expectedStatus FileStatus
		expectThreats  bool
	}{
		{
			name:           "clean file gets verified",
			fileContent:    []byte("This is a safe test file."),
			initialStatus:  TitanStatusUnverified,
			expectedStatus: TitanStatusVerified,
			expectThreats:  false,
		},
		{
			name:           "EICAR test file marked malicious",
			fileContent:    []byte("X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*"),
			initialStatus:  TitanStatusUnverified,
			expectedStatus: TitanStatusMalicious,
			expectThreats:  true,
		},
		{
			name:           "untracked file not scanned",
			fileContent:    []byte("X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*"),
			initialStatus:  TitanStatusUntracked,
			expectedStatus: TitanStatusUntracked,
			expectThreats:  false, // Should not scan
		},
		{
			name:           "already verified file not rescanned",
			fileContent:    []byte("X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*"),
			initialStatus:  TitanStatusVerified,
			expectedStatus: TitanStatusVerified,
			expectThreats:  false, // Should not scan
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			file := &testFile{
				content: tt.fileContent,
				status:  tt.initialStatus,
			}

			err := titan.HandleFile(ctx, file)
			if err != nil {
				t.Logf("HandleFile returned error: %v", err)
			}

			if file.Status() != tt.expectedStatus {
				t.Errorf("Status = %v, want %v", file.Status(), tt.expectedStatus)
			}
		})
	}
}

// TestClamdIntegration_LargeFile tests scanning a larger file
func TestClamdIntegration_LargeFile(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping integration test in short mode")
	}

	cleanup := setupClamD(t)
	defer cleanup()

	ctx := context.Background()

	scanner, err := NewClamdClient(ctx)
	if err != nil {
		t.Fatalf("Failed to create clamd client: %v", err)
	}

	// Create a larger clean file (1MB of repeated text)
	content := bytes.Repeat([]byte("This is a clean test file. "), 40000)
	file := &testFile{
		content: content,
		status:  TitanStatusUnverified,
	}

	signatures, err := scanner.Scan(ctx, file)
	if err != nil {
		t.Fatalf("Scan failed: %v", err)
	}

	if len(signatures) != 0 {
		t.Errorf("Expected no threats in large clean file, but found: %v", signatures)
	}
}

// TestClamdIntegration_MultipleScans tests scanning multiple files in sequence
func TestClamdIntegration_MultipleScans(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping integration test in short mode")
	}

	cleanup := setupClamD(t)
	defer cleanup()

	ctx := context.Background()

	scanner, err := NewClamdClient(ctx)
	if err != nil {
		t.Fatalf("Failed to create clamd client: %v", err)
	}

	// Scan multiple files to ensure the scanner handles multiple requests
	for i := 0; i < 5; i++ {
		file := &testFile{
			content: []byte("Clean file number " + string(rune(i))),
			status:  TitanStatusUnverified,
		}

		signatures, err := scanner.Scan(ctx, file)
		if err != nil {
			t.Fatalf("Scan %d failed: %v", i, err)
		}

		if len(signatures) != 0 {
			t.Errorf("Scan %d: expected no threats, but found: %v", i, signatures)
		}
	}
}

// TestMain can be used to set up test environment
func TestMain(m *testing.M) {
	// m.Run() must be called first to parse flags before testing.Short() can be used
	code := m.Run()
	os.Exit(code)
}
