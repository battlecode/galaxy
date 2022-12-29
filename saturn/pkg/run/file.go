package run

import (
	"archive/zip"
	"bytes"
	"context"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"

	"github.com/battlecode/galaxy/saturn/pkg/saturn"
	"github.com/rs/zerolog/log"
)

const (
	SourceBucket = "mitbattlecode-secure"
	BinaryBucket = "mitbattlecode-secure"
	ReplayBucket = "mitbattlecode-secure"
)

type FileSpecification struct {
	Bucket string `json:"bucket"`
	Name   string `json:"name"`
}

type StorageClient interface {
	GetFile(context.Context, FileSpecification, io.Writer) error
	UploadFile(context.Context, FileSpecification, io.Reader) error
}

func GetArchive(
	ctx context.Context,
	f saturn.Finisher,
	c StorageClient,
	spec FileSpecification,
	root string,
) error {
	var buf bytes.Buffer
	if err := c.GetFile(ctx, spec, &buf); err != nil {
		return fmt.Errorf("c.GetFile: %v", err)
	}

	n := int64(buf.Len())
	log.Ctx(ctx).Debug().Msgf("File retrieved, total %v bytes.", n)

	reader, err := zip.NewReader(bytes.NewReader(buf.Bytes()), n)
	if err != nil {
		log.Ctx(ctx).Debug().Err(err).Msgf("Archive is malformed: %v", err)
		f.Finish(saturn.TaskCompleted, map[string]interface{}{
			"accepted": false,
		})
		return fmt.Errorf("zip.NewReader: %v", err)
	}

	for _, file := range reader.File {
		local := filepath.Join(root, file.Name)
		if !strings.HasPrefix(local, root+string(filepath.Separator)) {
			log.Ctx(ctx).Debug().Msgf("Archive contains illegal path: %v", local)
			f.Finish(saturn.TaskCompleted, map[string]interface{}{
				"accepted": false,
			})
			return fmt.Errorf("illegal path: %v", local)
		}
		log.Ctx(ctx).Debug().Msgf("Extracting: %v", local)
		if file.FileInfo().IsDir() {
			continue
		}
		if err := os.MkdirAll(filepath.Dir(local), os.ModePerm); err != nil {
			return fmt.Errorf("os.MkdirAll: %v", err)
		}
		if err := getFileFromArchive(file, local); err != nil {
			return fmt.Errorf("getFileFromArchive: %w", err)
		}
	}
	return nil
}

func getFileFromArchive(file *zip.File, path string) error {
	reader, err := file.Open()
	if err != nil {
		return fmt.Errorf("file.Open: %v", err)
	}
	defer reader.Close()

	writer, err := os.Create(path)
	if err != nil {
		return fmt.Errorf("os.Create: %w", err)
	}
	defer writer.Close()

	if _, err := io.Copy(writer, reader); err != nil {
		return fmt.Errorf("io.Copy: %v", err)
	}
	return nil
}

func PutArchive(
	ctx context.Context,
	f saturn.Finisher,
	c StorageClient,
	spec FileSpecification,
	root string,
) error {
	buf := new(bytes.Buffer)
	zw := zip.NewWriter(buf)
	addFile := func(path string, d os.DirEntry, err error) error {
		if err != nil || d.IsDir() {
			return err
		}
		rel, err := filepath.Rel(root, path)
		if err != nil {
			return fmt.Errorf("filepath.Rel: %v", err)
		}

		reader, err := os.Open(path)
		if err != nil {
			return fmt.Errorf("os.Open: %v", err)
		}
		defer reader.Close()

		writer, err := zw.Create(rel)
		if err != nil {
			return fmt.Errorf("zw.Create: %v", err)
		}

		if _, err := io.Copy(writer, reader); err != nil {
			return fmt.Errorf("io.Copy: %v", err)
		}
		return nil
	}
	if err := filepath.WalkDir(root, addFile); err != nil {
		return fmt.Errorf("filepath.WalkDir: %v", err)
	}

	zw.Close()
	if err := c.UploadFile(ctx, spec, buf); err != nil {
		return fmt.Errorf("c.UploadFile: %v", err)
	}
	return nil
}
