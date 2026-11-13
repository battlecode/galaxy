package run

import (
	"context"
	"fmt"
	"io"
	"strings"

	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/api/types/image"
	"github.com/docker/docker/api/types/mount"
	"github.com/docker/docker/client"
	"github.com/rs/zerolog/log"
)

type ContainerRuntime interface {
	CreateContainer(ctx context.Context, config *ContainerConfig) (string, error)

	StartContainer(ctx context.Context, containerID string) error

	ExecCommand(ctx context.Context, containerID string, env []string, name string, args ...string) (string, error)

	StopContainer(ctx context.Context, containerID string, timeoutSeconds int) error

	RemoveContainer(ctx context.Context, containerID string) error

	GetLogs(ctx context.Context, containerID string) (io.ReadCloser, error)
}

type ContainerConfig struct {
	Image string

	onSaturn bool

	WorkDir string

	NetworkMode string

	CPULimit float64

	MemoryLimit int64

	ReadOnlyRootFS bool

	// Mounts specifies volume mounts as host:container:mode
	Mounts []string

	CapabilitiesToDrop []string

	CapabilitiesToAdd []string

	User string

	Env []string

	// Entrypoint overrides the image's ENTRYPOINT
	// Use empty slice to clear the image's entrypoint
	Entrypoint []string
}

// DockerRuntime implements ContainerRuntime using the Docker API
type DockerRuntime struct {
	client *client.Client
}

func NewDockerRuntime(ctx context.Context) (*DockerRuntime, error) {
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		return nil, fmt.Errorf("failed to create Docker client: %w", err)
	}

	// Verify Docker is accessible
	_, err = cli.Ping(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to ping Docker daemon: %w", err)
	}

	log.Ctx(ctx).Debug().Msg("Docker runtime initialized")
	return &DockerRuntime{client: cli}, nil
}

func (d *DockerRuntime) CreateContainer(ctx context.Context, config *ContainerConfig) (string, error) {
	log.Ctx(ctx).Debug().
		Str("image", config.Image).
		Str("network", config.NetworkMode).
		Msg("Creating container")

	if err := d.ensureImage(ctx, config.Image, config.onSaturn); err != nil {
		return "", fmt.Errorf("failed to ensure image: %w", err)
	}

	mounts := make([]mount.Mount, 0, len(config.Mounts))
	tmpfsMounts := make(map[string]string)
	for _, m := range config.Mounts {
		parts := strings.Split(m, ":")
		if len(parts) < 2 {
			return "", fmt.Errorf("invalid mount format: %s", m)
		}

		// Handle tmpfs mounts
		if parts[0] == "tmpfs" {
			// Format: tmpfs:/path:options
			path := parts[1]
			opts := ""
			if len(parts) >= 3 {
				opts = parts[2]
			}
			tmpfsMounts[path] = opts
			continue
		}

		// Handle bind mounts
		readOnly := false
		if len(parts) >= 3 && parts[2] == "ro" {
			readOnly = true
		}

		mounts = append(mounts, mount.Mount{
			Type:     mount.TypeBind,
			Source:   parts[0],
			Target:   parts[1],
			ReadOnly: readOnly,
		})
	}

	containerConfig := &container.Config{
		Image:      config.Image,
		WorkingDir: config.WorkDir,
		User:       config.User,
		Env:        config.Env,
		// Keep container running (we'll exec commands into it)
		Cmd:        []string{"/bin/sh", "-c", "sleep infinity"},
		Entrypoint: config.Entrypoint,
		Tty:        false,
		OpenStdin:  false,
	}

	hostConfig := &container.HostConfig{
		NetworkMode:    container.NetworkMode(config.NetworkMode),
		Mounts:         mounts,
		ReadonlyRootfs: config.ReadOnlyRootFS,
		SecurityOpt:    []string{"no-new-privileges"},
		Resources: container.Resources{
			NanoCPUs: int64(config.CPULimit * 1e9),
			Memory:   config.MemoryLimit,
		},
		CapDrop: config.CapabilitiesToDrop,
		CapAdd:  config.CapabilitiesToAdd,
	}

	// Merge tmpfs mounts
	if len(tmpfsMounts) > 0 || config.ReadOnlyRootFS {
		if hostConfig.Tmpfs == nil {
			hostConfig.Tmpfs = make(map[string]string)
		}
		for path, opts := range tmpfsMounts {
			hostConfig.Tmpfs[path] = opts
		}
	}

	resp, err := d.client.ContainerCreate(ctx, containerConfig, hostConfig, nil, nil, "")
	if err != nil {
		return "", fmt.Errorf("failed to create container: %w", err)
	}

	log.Ctx(ctx).Debug().
		Str("container_id", resp.ID[:12]).
		Msg("Container created")

	return resp.ID, nil
}

func (d *DockerRuntime) StartContainer(ctx context.Context, containerID string) error {
	log.Ctx(ctx).Debug().
		Str("container_id", containerID[:12]).
		Msg("Starting container")

	if err := d.client.ContainerStart(ctx, containerID, container.StartOptions{}); err != nil {
		return fmt.Errorf("failed to start container: %w", err)
	}

	return nil
}

func (d *DockerRuntime) ExecCommand(ctx context.Context, containerID string, env []string, name string, args ...string) (string, error) {
	cmd := append([]string{name}, args...)

	log.Ctx(ctx).Debug().
		Str("container_id", containerID[:12]).
		Str("command", strings.Join(cmd, " ")).
		Msg("Executing command in container")

	execConfig := container.ExecOptions{
		Cmd:          cmd,
		Env:          env,
		AttachStdout: true,
		AttachStderr: true,
		WorkingDir:   "", // Use container's working dir
	}

	execResp, err := d.client.ContainerExecCreate(ctx, containerID, execConfig)
	if err != nil {
		return "", fmt.Errorf("failed to create exec: %w", err)
	}

	// Attach to exec to capture output
	attachResp, err := d.client.ContainerExecAttach(ctx, execResp.ID, container.ExecAttachOptions{})
	if err != nil {
		return "", fmt.Errorf("failed to attach to exec: %w", err)
	}
	defer attachResp.Close()

	// Read all output
	output, err := io.ReadAll(attachResp.Reader)
	if err != nil {
		return "", fmt.Errorf("failed to read exec output: %w", err)
	}

	// Check exit code
	inspectResp, err := d.client.ContainerExecInspect(ctx, execResp.ID)
	if err != nil {
		return "", fmt.Errorf("failed to inspect exec: %w", err)
	}

	if inspectResp.ExitCode != 0 {
		return string(output), fmt.Errorf("command exited with code %d", inspectResp.ExitCode)
	}

	return string(output), nil
}

func (d *DockerRuntime) StopContainer(ctx context.Context, containerID string, timeoutSeconds int) error {
	log.Ctx(ctx).Debug().
		Str("container_id", containerID[:12]).
		Int("timeout", timeoutSeconds).
		Msg("Stopping container")

	timeout := timeoutSeconds
	if err := d.client.ContainerStop(ctx, containerID, container.StopOptions{Timeout: &timeout}); err != nil {
		return fmt.Errorf("failed to stop container: %w", err)
	}

	return nil
}

func (d *DockerRuntime) RemoveContainer(ctx context.Context, containerID string) error {
	log.Ctx(ctx).Debug().
		Str("container_id", containerID[:12]).
		Msg("Removing container")

	if err := d.client.ContainerRemove(ctx, containerID, container.RemoveOptions{Force: true}); err != nil {
		return fmt.Errorf("failed to remove container: %w", err)
	}

	return nil
}

func (d *DockerRuntime) GetLogs(ctx context.Context, containerID string) (io.ReadCloser, error) {
	options := container.LogsOptions{
		ShowStdout: true,
		ShowStderr: true,
		Follow:     false,
	}

	logs, err := d.client.ContainerLogs(ctx, containerID, options)
	if err != nil {
		return nil, fmt.Errorf("failed to get container logs: %w", err)
	}

	return logs, nil
}

// ensureImage handles ensuring the container image is available, either by pulling or building.
func (d *DockerRuntime) ensureImage(ctx context.Context, imageName string, onSaturn bool) error {
	// First, check if the image already exists locally
	_, _, err := d.client.ImageInspectWithRaw(ctx, imageName)
	if err == nil {
		log.Ctx(ctx).Debug().Str("image", imageName).Msg("Image already exists locally")
		return nil
	}

	if !onSaturn {
		// For local development, the imageName should be a pre-built image name
		log.Ctx(ctx).Error().
			Str("image", imageName).
			Msg("Image not found locally. Please run 'make dev-build' first.")
		return fmt.Errorf("image %s not found locally - run 'make dev-build' to build it", imageName)
	}

	// On Saturn (production), pull the image from registry
	log.Ctx(ctx).Info().
		Str("image", imageName).
		Msg("Pulling container image")

	reader, err := d.client.ImagePull(ctx, imageName, image.PullOptions{})
	if err != nil {
		return fmt.Errorf("failed to pull image: %w", err)
	}
	defer reader.Close()

	// Wait for pull to complete.
	if _, err := io.Copy(io.Discard, reader); err != nil {
		return fmt.Errorf("failed to wait for image pull: %w", err)
	}

	log.Ctx(ctx).Info().
		Str("image", imageName).
		Msg("Image pulled successfully")

	return nil
}

func (d *DockerRuntime) Close() error {
	if d.client != nil {
		return d.client.Close()
	}
	return nil
}
