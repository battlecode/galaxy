package titan

import (
	"context"
	"fmt"
	"os"

	"github.com/baruwa-enterprise/clamd"
)

type Scanner interface {
	// Scan scans a file for malware, returning all malware signatures that are found.
	// An empty slice indicates that the file is safe.
	Scan(ctx context.Context, file File) ([]string, error)
}

// ClamdClient is a client to clamd, the ClamAV daemon.
type ClamdClient struct {
	client *clamd.Client
}

// NewClamdClient creates a new client to clamd.
// It uses TCP connection if CLAMD_TCP is set, otherwise Unix socket (default).
func NewClamdClient(ctx context.Context) (*ClamdClient, error) {
	var client *clamd.Client
	var err error

	// In CI or if CLAMD_TCP is set, use TCP connection
	if os.Getenv("CLAMD_TCP") != "" {
		client, err = clamd.NewClient("tcp", "127.0.0.1:3310")
	} else {
		// Default: use Unix socket
		client, err = clamd.NewClient("", "")
	}

	if err != nil {
		return nil, fmt.Errorf("clamd.NewClient: %v", err)
	}
	return &ClamdClient{client}, nil
}

func (c *ClamdClient) Scan(ctx context.Context, file File) ([]string, error) {
	reader, err := file.NewReader(ctx)
	if err != nil {
		return nil, fmt.Errorf("file.NewReader: %v", err)
	}
	defer reader.Close()

	responses, err := c.client.ScanReader(ctx, reader)
	if err != nil {
		return nil, fmt.Errorf("client.ScanReader: %v", err)
	}

	var signatures []string
	for _, r := range responses {
		if r.Status != "OK" {
			signatures = append(signatures, r.Signature)
		}
	}
	return signatures, nil
}
