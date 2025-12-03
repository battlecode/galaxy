package titan

import (
	"context"
	"io"
)

// FileStatus is the Titan status of a file, indicating whether it has been scanned and
// whether it is safe. Unverified files are yet to be scanned, and untracked files are
// ignored by the Titan system.
type FileStatus string

const (
	TitanStatusUntracked  FileStatus = "Untracked"
	TitanStatusUnverified FileStatus = "Unverified"
	TitanStatusVerified   FileStatus = "Verified"
	TitanStatusMalicious  FileStatus = "Malicious"
)

// StorageClient is a client to a file storage service.
type StorageClient interface {
	// GetFile retrieves the file specified by a scan payload.
	GetFile(context.Context, *ScanPayload) (File, error)
}

// File is a handle to manage a file stored in a file storage service.
type File interface {
	// NewReader creates a new reader to read the contents of the file.
	NewReader(context.Context) (io.ReadCloser, error)

	// Status retrieves the Titan status of the file.
	Status() FileStatus

	// SetStatus updates the Titan status of the file.
	SetStatus(context.Context, FileStatus) error
}
