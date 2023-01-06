package saturn

import (
	"context"
	"encoding/json"
	"fmt"

	"cloud.google.com/go/pubsub"
	"github.com/rs/zerolog/log"
)

type QueuedTaskHandler func(context.Context, TaskPayload) error

type QueueClient interface {
	Subscribe(context.Context, QueuedTaskHandler) error
}

type GCPPubsubSubscriber struct {
	client       *pubsub.Client
	subscription *pubsub.Subscription
}

func NewGCPPubsubSubscriber(ctx context.Context, projectID, subscriptionID string) (*GCPPubsubSubscriber, error) {
	client, err := pubsub.NewClient(ctx, projectID)
	if err != nil {
		return nil, fmt.Errorf("pubsub.NewClient: %v", err)
	}

	subscription := client.Subscription(subscriptionID)
	subscription.ReceiveSettings.Synchronous = true
	subscription.ReceiveSettings.MaxOutstandingMessages = 1

	return &GCPPubsubSubscriber{client, subscription}, nil
}

func (c *GCPPubsubSubscriber) Subscribe(ctx context.Context, handler QueuedTaskHandler) error {
	err := c.subscription.Receive(ctx, func(ctx context.Context, msg *pubsub.Message) {
		defer msg.Nack()
		var task TaskPayload
		if err := json.Unmarshal(msg.Data, &task); err != nil {
			log.Ctx(ctx).Error().Err(err).Msg("Invalid message.")
			// TODO log a traceback
			msg.Ack() // No point in retrying this.
			return
		}
		if err := handler(ctx, task); err != nil {
			log.Ctx(ctx).Error().Err(err).Msg("Invocation failed.")
			// TODO log a traceback, unless context canceled.
			return
		}
		msg.Ack()
	})
	if err != nil {
		return fmt.Errorf("subscription.Receive: %v", err)
	}
	return nil
}
