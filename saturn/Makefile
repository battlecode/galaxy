.PHONY: dev-fetch-secret dev-build dev-compile dev-execute dev-shell dev-shell-saturn dev-clean help
.PHONY: dev-docker-up dev-docker-down dev-docker-logs dev-docker-rebuild dev-pubsub-interactive
.PHONY: dev-list-runs dev-clean-runs dev-view-run

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Quick Start:'
	@echo '  make dev-fetch-secret       # Fetch secrets from GCP'
	@echo '  make dev-build              # Build Docker images'
	@echo '  make dev-docker-up          # Start all services (creates new run)'
	@echo '  make dev-compile            # Test compilation'
	@echo '  make dev-execute            # Test execution'
	@echo '  make dev-pubsub-interactive # Interactive Pub/Sub client'
	@echo ''
	@echo 'Run Management:'
	@echo '  make dev-list-runs          # List all test runs'
	@echo '  make dev-docker-logs        # View logs for current run'
	@echo '  make dev-view-run RUN_ID=X  # View logs for specific run'
	@echo '  make dev-clean-runs         # Clean old runs (keeps 5)'
	@echo ''
	@echo 'All available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-27s\033[0m %s\n", $$1, $$2}'

dev-fetch-secret: ## Fetch secrets from Google Cloud Secret Manager
	@# TODO: Eliminate storing secret locally
	@echo "Fetching secret from GCP Secret Manager..."
	@# Check if gcloud is installed
	@if ! command -v gcloud >/dev/null 2>&1; then \
		echo "Error: gcloud CLI is not installed"; \
		echo "Install from: https://cloud.google.com/sdk/docs/install"; \
		exit 1; \
	fi
	@# Check if authenticated
	@if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" >/dev/null 2>&1; then \
		echo "Error: Not authenticated with gcloud"; \
		echo "Run: gcloud auth login"; \
		exit 1; \
	fi
	@mkdir -p development/secrets
	@gcloud secrets versions access latest \
		--secret="production-saturn" \
		--project="mitbattlecode" \
		> development/secrets/secret.json
	@echo "✓ Secret saved to development/secrets/secret.json"

dev-build: ## Build all Docker images
	@echo "Building Docker images..."
	@cd development && docker-compose build
	@echo "✓ Docker images built"

dev-compile: ## Send a compile message
	@# Check if a run is active
	@if [ ! -f development/runs/latest ]; then \
		echo "Error: No active run found. Start services with 'make dev-docker-up' first."; \
		exit 1; \
	fi
	@# Generate request ID
	$(eval RUN_ID := $(shell cat development/runs/latest))
	$(eval REQUEST_ID := $(shell date +%Y%m%d_%H%M%S))
	@# Create request directory structure
	@mkdir -p development/runs/$(RUN_ID)/requests/compile_$(REQUEST_ID)
	@echo "Creating compile request: compile_$(REQUEST_ID)"
	@# Generate config from template
	@sed \
		-e 's|{{REPORT_PATH}}|/development/runs/$(RUN_ID)/requests/compile_$(REQUEST_ID)/report.txt|g' \
		-e 's|{{BINARY_PATH}}|/development/runs/$(RUN_ID)/requests/compile_$(REQUEST_ID)/binary.zip|g' \
		development/configs/compile.template.json \
		> development/runs/$(RUN_ID)/requests/compile_$(REQUEST_ID)/config.json
	@echo "✓ Config generated: development/runs/$(RUN_ID)/requests/compile_$(REQUEST_ID)/config.json"
	@# Send compile message with generated config
	@docker exec saturn-pubsub-dev ./pubsubclient publish-json testing-saturn /development/runs/$(RUN_ID)/requests/compile_$(REQUEST_ID)/config.json
	@echo "✓ Compile message sent"
	@echo "✓ Request ID: compile_$(REQUEST_ID)"
	@echo "✓ Output directory: development/runs/$(RUN_ID)/requests/compile_$(REQUEST_ID)/"

dev-execute: ## Send an execute message
	@# Check if a run is active
	@if [ ! -f development/runs/latest ]; then \
		echo "Error: No active run found. Start services with 'make dev-docker-up' first."; \
		exit 1; \
	fi
	@# Generate request ID
	$(eval RUN_ID := $(shell cat development/runs/latest))
	$(eval REQUEST_ID := $(shell date +%Y%m%d_%H%M%S))
	@# Create request directory structure
	@mkdir -p development/runs/$(RUN_ID)/requests/execute_$(REQUEST_ID)
	@echo "Creating execute request: execute_$(REQUEST_ID)"
	@# Generate config from template
	@sed \
		-e 's|{{REPORT_PATH}}|/development/runs/$(RUN_ID)/requests/execute_$(REQUEST_ID)/report.txt|g' \
		-e 's|{{REPLAY_PATH}}|/development/runs/$(RUN_ID)/requests/execute_$(REQUEST_ID)/replay.bc25java|g' \
		development/configs/execute.template.json \
		> development/runs/$(RUN_ID)/requests/execute_$(REQUEST_ID)/config.json
	@echo "✓ Config generated: development/runs/$(RUN_ID)/requests/execute_$(REQUEST_ID)/config.json"
	@# Send execute message with generated config
	@docker exec saturn-pubsub-dev ./pubsubclient publish-json testing-saturn /development/runs/$(RUN_ID)/requests/execute_$(REQUEST_ID)/config.json
	@echo "✓ Execute message sent"
	@echo "✓ Request ID: execute_$(REQUEST_ID)"
	@echo "✓ Output directory: development/runs/$(RUN_ID)/requests/execute_$(REQUEST_ID)/"

dev-shell-pubsub: ## Open shell in Pub/Sub container
	@docker exec -it saturn-pubsub-dev bash

dev-pubsub-interactive: ## Open interactive Pub/Sub client with rlwrap
	@echo "Starting interactive Pub/Sub client..."
	@echo "Available commands will be shown below."
	@echo "Use Ctrl+D or Ctrl+C to exit."
	@echo ""
	@docker exec -it saturn-pubsub-dev rlwrap bash -c '\
		./pubsubclient; \
		echo ""; \
		echo "Interactive mode - enter commands:"; \
		while true; do \
			read -e -p "$$ " cmd || break; \
			eval "$$cmd"; \
		done'

dev-shell-saturn: ## Open shell in Saturn container
	@docker exec -it saturn-dev bash

dev-clean: ## Clean up Docker containers and images
	@echo "Cleaning up development environment..."
	@cd development && docker-compose down -v
	@docker rmi development-pubsub-emulator development-saturn 2>/dev/null || true
	@echo "✓ Cleanup complete"

dev-docker-up: ## Start all Docker services and show logs
	@# Generate run ID
	$(eval RUN_ID := $(shell date +%Y%m%d_%H%M%S))
	@echo "Starting run: $(RUN_ID)"
	@echo ""
	@# Create run directory structure
	@mkdir -p development/runs/$(RUN_ID)/scaffolds
	@mkdir -p development/runs/$(RUN_ID)/logs
	@echo "$(RUN_ID)" > development/runs/latest
	@# Start services with run-specific scaffold directory
	@echo "Starting Docker services..."
	@cd development && \
		RUN_ID=$(RUN_ID) \
		SCAFFOLD_DIR=./runs/$(RUN_ID)/scaffolds \
		docker-compose up -d
	@echo "✓ Services started"
	@echo "✓ Run ID: $(RUN_ID)"
	@echo "✓ Scaffolds: development/runs/$(RUN_ID)/scaffolds"
	@echo "✓ Logs: development/runs/$(RUN_ID)/logs"
	@echo ""
	@# Start background log capture
	@echo "Capturing logs to development/runs/$(RUN_ID)/logs/"
	@(cd development && docker-compose logs -f) > development/runs/$(RUN_ID)/logs/combined.log 2>&1 & echo $$! > development/runs/$(RUN_ID)/logs/.logger.pid
	@# Tail logs to terminal with colorized container names
	@echo "Showing logs (Ctrl+C to exit, services and logging will keep running)..."
	@echo ""
	@tail -f development/runs/$(RUN_ID)/logs/combined.log | sed \
		-e 's/saturn-pubsub-dev/\x1b[36msaturn-pubsub-dev\x1b[0m/g' \
		-e 's/saturn-dev[^-]/\x1b[33msaturn-dev\x1b[0m/g'

dev-docker-down: ## Stop all Docker services
	@echo "Stopping Docker services..."
	@# Stop background logger if running
	@if [ -f development/runs/$$(cat development/runs/latest 2>/dev/null)/logs/.logger.pid ]; then \
		kill $$(cat development/runs/$$(cat development/runs/latest)/logs/.logger.pid) 2>/dev/null || true; \
		rm development/runs/$$(cat development/runs/latest)/logs/.logger.pid; \
	fi
	@cd development && docker-compose down
	@echo "✓ Services stopped"

dev-docker-logs: ## View logs for current run
	@if [ ! -f development/runs/latest ]; then \
		echo "No active run found. Start services with 'make dev-docker-up' first."; \
		exit 1; \
	fi
	@RUN_ID=$$(cat development/runs/latest); \
	echo "Viewing logs for run: $$RUN_ID"; \
	echo ""; \
	tail -f development/runs/$$RUN_ID/logs/combined.log | sed \
		-e 's/saturn-pubsub-dev/\x1b[36msaturn-pubsub-dev\x1b[0m/g' \
		-e 's/saturn-dev[^-]/\x1b[33msaturn-dev\x1b[0m/g'

dev-docker-rebuild: ## Rebuild Docker images and restart services
	@echo "Rebuilding and restarting Docker services..."
	@cd development && docker-compose up -d --build
	@echo "✓ Rebuild complete"

dev-list-runs: ## List all test runs
	@echo "Available test runs:"
	@echo ""
	@if [ -d development/runs ]; then \
		for run in $$(ls -t development/runs | grep -E '^[0-9]{8}_[0-9]{6}$$'); do \
			echo "  $$run"; \
			if [ -d "development/runs/$$run/scaffolds" ]; then \
				scaffold_count=$$(find development/runs/$$run/scaffolds -type f 2>/dev/null | wc -l | tr -d ' '); \
				echo "    Scaffolds: $$scaffold_count files"; \
			fi; \
			if [ -f "development/runs/$$run/logs/combined.log" ]; then \
				log_size=$$(du -h development/runs/$$run/logs/combined.log | cut -f1); \
				echo "    Logs: $$log_size"; \
			fi; \
			echo ""; \
		done; \
	else \
		echo "  No runs found"; \
	fi
	@if [ -f development/runs/latest ]; then \
		echo "Latest run: $$(cat development/runs/latest)"; \
	fi

dev-view-run: ## View logs for a specific run (usage: make dev-view-run RUN_ID=20260102_134523)
	@if [ -z "$(RUN_ID)" ]; then \
		echo "Error: Please specify RUN_ID"; \
		echo "Usage: make dev-view-run RUN_ID=20260102_134523"; \
		echo ""; \
		echo "Available runs:"; \
		ls -1 development/runs | grep -E '^[0-9]{8}_[0-9]{6}$$' || echo "  No runs found"; \
		exit 1; \
	fi
	@if [ ! -f "development/runs/$(RUN_ID)/logs/combined.log" ]; then \
		echo "Error: Run $(RUN_ID) not found or has no logs"; \
		exit 1; \
	fi
	@echo "Viewing logs for run: $(RUN_ID)"
	@echo ""
	@tail -f development/runs/$(RUN_ID)/logs/combined.log | sed \
		-e 's/saturn-pubsub-dev/\x1b[36msaturn-pubsub-dev\x1b[0m/g' \
		-e 's/saturn-dev[^-]/\x1b[33msaturn-dev\x1b[0m/g'

dev-clean-runs: ## Clean old test runs (keeps latest 5)
	@echo "Cleaning old test runs..."
	@if [ -d development/runs ]; then \
		runs_to_delete=$$(ls -t development/runs | grep -E '^[0-9]{8}_[0-9]{6}$$' | tail -n +6); \
		if [ -n "$$runs_to_delete" ]; then \
			echo "Deleting old runs:"; \
			for run in $$runs_to_delete; do \
				echo "  $$run"; \
				rm -rf development/runs/$$run; \
			done; \
			echo "✓ Cleanup complete"; \
		else \
			echo "No old runs to clean (keeping latest 5)"; \
		fi; \
	else \
		echo "No runs directory found"; \
	fi
