package saturn

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"

	"github.com/rs/zerolog/log"
	"google.golang.org/api/idtoken"
)

type Reporter interface {
	Report(context.Context, *Task) error
}

type GCPTokenedReporter struct {
	client    *http.Client
	userAgent string
}

func NewGCPTokenedReporter(
	ctx context.Context,
	audience, userAgent string,
) (*GCPTokenedReporter, error) {
	client, err := idtoken.NewClient(ctx, audience)
	if err != nil {
		return nil, fmt.Errorf("idtoken.NewClient: %v", err)
	}

	// Allow following redirect for POST requests
	client.CheckRedirect = func(req *http.Request, via []*http.Request) error {
		if len(via) >= 10 {
			return fmt.Errorf("stopped after 10 redirects")
		}
		if via[0].GetBody == nil {
			return fmt.Errorf("could not get original body")
		}

		var err error
		req.Method = http.MethodPost
		req.Body, err = via[0].GetBody()
		if err != nil {
			return fmt.Errorf("GetBody: %v", err)
		}
		return nil
	}
	return &GCPTokenedReporter{client, userAgent}, nil
}

func (r *GCPTokenedReporter) Report(ctx context.Context, t *Task) error {
	payload := make(map[string]interface{})
	for k, v := range t.details {
		payload[k] = v
	}
	logs, err := ioutil.ReadAll(&t.logs)
	if err != nil {
		return fmt.Errorf("ioutil.ReadAll: %v", err)
	}
	payload["invocation"] = map[string]interface{}{
		"status":      t.status.String(),
		"logs":        string(logs),
		"interrupted": t.status == TaskInterrupted,
	}

	reqBody, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("json.Marshal: %v", err)
	}
	log.Ctx(ctx).Debug().RawJSON("payload", reqBody).Msg("Sending report.")

	req, err := http.NewRequest("POST", t.Payload.Metadata.ReportURL, bytes.NewBuffer(reqBody))
	if err != nil {
		return fmt.Errorf("http.NewRequestWithContext: %v", err)
	}
	req.Header.Set("User-Agent", r.userAgent)
	req.Header.Set("Content-Type", "application/json")

	resp, err := r.client.Do(req)
	if err != nil {
		return fmt.Errorf("r.client.Do: %v", err)
	}
	defer resp.Body.Close()

	respBody, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("ioutil.ReadAll: %v", err)
	}
	log.Ctx(ctx).Debug().Bytes("response", respBody).Msg("Report sent.")

	if resp.StatusCode == http.StatusConflict {
		t.Finish(TaskAborted, nil)
	}
	if !(200 <= resp.StatusCode && resp.StatusCode < 300) {
		return fmt.Errorf("bad status code: %v", resp.StatusCode)
	}
	return nil
}
