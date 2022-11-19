package titan

import (
	"context"
	"fmt"
	"io"

	"cloud.google.com/go/storage"
	"github.com/rs/zerolog/log"
)

// GCSMetadataKey is the metadata key used to tag GCS objects for Titan.
const GCSMetadataKey = "Titan-Status"

// GCSClient is a client to Google CLoud Storage.
type GCSClient struct {
	client *storage.Client
}

// NewGCSClient constructs a new client to Google Cloud Storage.
func NewGCSClient(ctx context.Context) (*GCSClient, error) {
	client, err := storage.NewClient(ctx)
	if err != nil {
		return nil, fmt.Errorf("storage.NewClient: %v", err)
	}
	return &GCSClient{client}, nil
}

func (c *GCSClient) GetFile(ctx context.Context, data *EventPayload) (File, error) {
	handle := c.client.Bucket(data.Bucket).Object(data.Name)
	attrs, err := handle.Attrs(ctx)
	if err != nil {
		return nil, fmt.Errorf("handle.Attrs: %v", err)
	}
	handle = handle.If(
		storage.Conditions{MetagenerationMatch: attrs.Metageneration},
	)
	return &GCSObject{data.Bucket, data.Name, handle, attrs}, nil
}

// GCSObject is a handle to manage an object in Google Cloud Storage.
type GCSObject struct {
	bucket, name string
	handle       *storage.ObjectHandle
	attrs        *storage.ObjectAttrs
}

func (o *GCSObject) NewReader(ctx context.Context) (io.ReadCloser, error) {
	return o.handle.NewReader(ctx)
}

func (o *GCSObject) Status() FileStatus {
	status, ok := o.attrs.Metadata[GCSMetadataKey]
	if !ok {
		return TitanStatusUntracked
	}
	return FileStatus(status)
}

func (o *GCSObject) SetStatus(ctx context.Context, status FileStatus) error {
	log.Ctx(ctx).Debug().Str("status", string(status)).Msg("Updating object metadata.")
	objectAttrsToUpdate := storage.ObjectAttrsToUpdate{
		Metadata: map[string]string{
			GCSMetadataKey: string(status),
		},
	}
	if _, err := o.handle.Update(ctx, objectAttrsToUpdate); err != nil {
		return fmt.Errorf("handle.Update: %v", err)
	}
	log.Ctx(ctx).Debug().Msg("Metadata updated successfully.")
	return nil
}
