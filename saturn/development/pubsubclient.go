package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"cloud.google.com/go/pubsub"
	"google.golang.org/api/option"
)

func main() {
	AllCommands := []string{
		"create-topic <topic-name>",
		"create-pull-subscription <topic-name> <subscription-name>",
		"publish <topic-name> <message>",
		"publish-json <topic-name> <json-file-path>",
		"subscribe <subscription-name>",
	}
	quickCommands := []string{
		"compile: to send message in compile.json",
		"execute: to send message in execute.json",
		"sub: to recieve message",
	}
	if len(os.Args) < 2 {
		fmt.Println("Usage: ./pubsubclient <command> [args]")
		fmt.Println("Quick commands shortcuts:")
		for _, cmd := range quickCommands {
			fmt.Println("  -", cmd)
		}
		fmt.Println("All commands:")
		for _, cmd := range AllCommands {
			fmt.Println("  -", cmd)
		}
		os.Exit(1)
	}

	command := os.Args[1]
	ctx := context.Background()
	projectID := "mitbattlecode" // Replace with your GCP project ID

	if os.Getenv("PUBSUB_EMULATOR_HOST") != "" {
		os.Setenv("PUBSUB_PROJECT_ID", projectID)
	}

	client, err := pubsub.NewClient(ctx, projectID, option.WithoutAuthentication())
	if err != nil {
		log.Fatalf("Failed to create Pub/Sub client: %v", err)
	}
	defer client.Close()

	switch command {
	case "compile":
		publishJSONMessage(ctx, client, "testing-saturn", "/development/compile.json")

	case "execute":
		publishJSONMessage(ctx, client, "testing-saturn", "/development/execute.json")

	case "sub":
		subscribe(ctx, client, "test")

	case "create-topic":
		if len(os.Args) < 3 {
			log.Fatalf("Usage: ./pubsubclient create-topic <topic-name>")
		}
		topicName := os.Args[2]
		createTopic(ctx, client, topicName)

	case "create-pull-subscription":
		if len(os.Args) < 4 {
			log.Fatalf("Usage: ./pubsubclient create-pull-subscription <topic-name> <subscription-name>")
		}
		topicName := os.Args[2]
		subscriptionName := os.Args[3]
		createPullSubscription(ctx, client, topicName, subscriptionName)

	case "publish":
		if len(os.Args) < 4 {
			log.Fatalf("Usage: ./pubsubclient publish <topic-name> <message>")
		}
		topicName := os.Args[2]
		message := os.Args[3]
		publishMessage(ctx, client, topicName, message)

	case "publish-json":
		if len(os.Args) < 4 {
			log.Fatalf("Usage: ./pubsubclient publish-json <topic-name> <json-file-path>")
		}
		topicName := os.Args[2]
		jsonFilePath := os.Args[3]
		publishJSONMessage(ctx, client, topicName, jsonFilePath)

	case "subscribe":
		if len(os.Args) < 3 {
			log.Fatalf("Usage: ./pubsubclient subscribe <subscription-name>")
		}
		subscriptionName := os.Args[2]
		subscribe(ctx, client, subscriptionName)

	default:
		log.Fatalf("Unknown command: %s", command)
	}
}

func createTopic(ctx context.Context, client *pubsub.Client, topicName string) {
	topic, err := client.CreateTopic(ctx, topicName)
	if err != nil {
		log.Fatalf("Failed to create topic: %v", err)
	}
	fmt.Printf("Topic %s created successfully\n", topic.ID())
}

func createPullSubscription(ctx context.Context, client *pubsub.Client, topicName, subscriptionName string) {
	topic := client.Topic(topicName)
	sub, err := client.CreateSubscription(ctx, subscriptionName, pubsub.SubscriptionConfig{
		Topic: topic,
	})
	if err != nil {
		log.Fatalf("Failed to create pull subscription: %v", err)
	}
	fmt.Printf("Pull subscription %s created successfully\n", sub.ID())
}

func publishJSONMessage(ctx context.Context, client *pubsub.Client, topicName, jsonFilePath string) {
	// Read the JSON file
	jsonData, err := os.ReadFile(jsonFilePath)
	if err != nil {
		log.Fatalf("Failed to read JSON file: %v", err)
	}

	// Publish the JSON message
	topic := client.Topic(topicName)
	result := topic.Publish(ctx, &pubsub.Message{
		Data: jsonData,
	})

	msgID, err := result.Get(ctx)
	if err != nil {
		log.Fatalf("Failed to publish JSON message: %v", err)
	}
	fmt.Printf("JSON message published with ID: %s\n", msgID)
}
func publishMessage(ctx context.Context, client *pubsub.Client, topicName, message string) {
	topic := client.Topic(topicName)
	result := topic.Publish(ctx, &pubsub.Message{
		Data: []byte(message),
	})

	msgID, err := result.Get(ctx)
	if err != nil {
		log.Fatalf("Failed to publish message: %v", err)
	}
	fmt.Printf("Message published with ID: %s\n", msgID)
}

func subscribe(ctx context.Context, client *pubsub.Client, subscriptionName string) {
	sub := client.Subscription(subscriptionName)
	err := sub.Receive(ctx, func(ctx context.Context, msg *pubsub.Message) {
		fmt.Printf("Received message: %s\n", string(msg.Data))
		msg.Ack()
	})
	if err != nil {
		log.Fatalf("Failed to receive messages: %v", err)
	}
}
