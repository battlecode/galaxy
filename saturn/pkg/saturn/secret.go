package saturn

import (
	"context"
	"encoding/json"
	"fmt"

	secretmanager "cloud.google.com/go/secretmanager/apiv1"
	"cloud.google.com/go/secretmanager/apiv1/secretmanagerpb"
)

type Secret struct {
	GitToken string `json:"git-token"`
}

func ReadSecret(ctx context.Context, projectID, name string) (*Secret, error) {
	client, err := secretmanager.NewClient(ctx)
	if err != nil {
		return nil, fmt.Errorf("secretmanager.NewClient: %v", err)
	}
	defer client.Close()

	request := &secretmanagerpb.AccessSecretVersionRequest{
		Name: fmt.Sprintf("projects/%s/secrets/%s/versions/latest", projectID, name),
	}
	resp, err := client.AccessSecretVersion(ctx, request)
	if err != nil {
		return nil, fmt.Errorf("client.AccessSecretVersionRequest: %v", err)
	}

	var result Secret
	if err := json.Unmarshal(resp.Payload.Data, &result); err != nil {
		return nil, fmt.Errorf("json.Unmarshal: %v", err)
	}
	return &result, nil
}
