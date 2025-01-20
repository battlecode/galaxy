package run

import (
	"context"
	"fmt"
	"io"
	"os"
	"path/filepath"

	"cloud.google.com/go/storage"
	"github.com/rs/zerolog/log"
)

type GCSClient struct {
	c *storage.Client
}

func NewGCSClient(ctx context.Context) (*GCSClient, error) {
	client, err := storage.NewClient(ctx)
	if err != nil {
		return nil, fmt.Errorf("storage.NewClient: %v", err)
	}
	return &GCSClient{client}, nil
}

func (c *GCSClient) GetFile(ctx context.Context, f FileSpecification, w io.Writer) error {
	if f.Bucket == "local" {
		file, err := os.Open(f.Name)
		if err != nil {
			return fmt.Errorf("os.Open: %v", err)
		}
		defer file.Close()

		written, err := io.Copy(w, file)
		if err != nil {
			return fmt.Errorf("io.Copy: %v", err)
		}
		log.Ctx(ctx).Debug().Msgf("Read %d bytes from local file.", written)
		return nil
	}
	object := c.c.Bucket(f.Bucket).Object(f.Name)
	reader, err := object.NewReader(ctx)
	if err != nil {
		return fmt.Errorf("object.NewReader: %v", err)
	}
	defer reader.Close()

	written, err := io.Copy(w, reader)
	if err != nil {
		return fmt.Errorf("io.Copy: %v", err)
	}
	log.Ctx(ctx).Debug().Msgf("Downloaded %d bytes.", written)
	return nil
}

func (c *GCSClient) UploadFile(ctx context.Context, f FileSpecification, r io.Reader, public bool) error {
	if f.Bucket == "local" {
		// Ensure the directory exists
		if err := os.MkdirAll(filepath.Dir(f.Name), os.ModePerm); err != nil {
			return fmt.Errorf("os.MkdirAll: %v", err)
		}

		file, err := os.Create(f.Name)
		if err != nil {
			return fmt.Errorf("os.Create: %v", err)
		}
		defer file.Close()

		written, err := io.Copy(file, r)
		if err != nil {
			return fmt.Errorf("io.Copy: %v", err)
		}
		log.Ctx(ctx).Debug().Msgf("Wrote %d bytes to local file.", written)
		return nil
	}
	object := c.c.Bucket(f.Bucket).Object(f.Name)
	writer := object.NewWriter(ctx)
	defer writer.Close()

	writer.ContentType = "application/octet-stream"
	if public {
		writer.PredefinedACL = "publicRead"
	} else {
		writer.PredefinedACL = "projectPrivate"
	}

	written, err := io.Copy(writer, r)
	if err != nil {
		return fmt.Errorf("io.Copy: %v", err)
	}
	log.Ctx(ctx).Debug().Msgf("Uploaded %d bytes.", written)
	return nil
}
