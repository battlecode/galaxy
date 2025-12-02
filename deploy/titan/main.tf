resource "google_service_account" "this" {
  account_id   = var.name
  display_name = "Titan Agent"
  description  = "Service account for perform Titan actions"
}

resource "google_storage_bucket_iam_member" "this" {
  for_each = toset(var.storage_names)

  bucket = each.value
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${google_service_account.this.email}"
}

resource "google_pubsub_subscription" "scan" {
  name  = "${var.name}-scan"
  topic = var.pubsub_topic_scan_name
  labels = var.labels

  push_config {
    push_endpoint = google_cloud_run_service.this.status[0].url

    oidc_token {
      service_account_email = google_service_account.this.email
    }
  }

  ack_deadline_seconds       = 600
  message_retention_duration = "604800s"  # 7 days

  retry_policy {
    minimum_backoff = "10s"
    maximum_backoff = "600s"
  }

  depends_on = [
    google_cloud_run_service_iam_member.this,
  ]
}

resource "google_cloud_run_service" "this" {
  name     = var.name
  location = var.gcp_region

  template {
    spec {
      service_account_name  = google_service_account.this.email
      container_concurrency = 10

      containers {
        image = var.image

        resources {
          limits = {
            cpu    = "2000m"
            memory = "4Gi"
          }
        }
      }
    }
    metadata {
      labels = var.labels
    }
  }

  metadata {
    annotations = {
      "run.googleapis.com/ingress" = "internal"
    }
  }

  autogenerate_revision_name = true

  traffic {
    percent         = 100
    latest_revision = true
  }

  depends_on = [google_storage_bucket_iam_member.this]

  lifecycle {
    ignore_changes = [
      metadata[0].annotations["run.googleapis.com/operation-id"],
    ]
  }
}

resource "google_cloud_run_service_iam_member" "this" {
  project  = google_cloud_run_service.this.project
  location = google_cloud_run_service.this.location
  service  = google_cloud_run_service.this.name
  role     = "roles/run.invoker"
  member   = "serviceAccount:${google_service_account.this.email}"
}

resource "google_cloudbuild_trigger" "this" {
  name            = var.name

  github {
    owner = "battlecode"
    name  = "galaxy"

    push {
      tag = "^titan-.*"
    }
  }

  build {
    step {
      name = "gcr.io/cloud-builders/docker"
      args = ["build", "--build-arg", "REVISION_ARG=$TAG_NAME+$SHORT_SHA.$BUILD_ID", "-t", var.image, "."]
      dir  = "titan"
    }
    step {
      name = "gcr.io/cloud-builders/docker"
      args = ["push", var.image]
    }
    step {
      name = "gcr.io/google.com/cloudsdktool/cloud-sdk"
      entrypoint = "gcloud"
      args = ["run", "deploy", google_cloud_run_service.this.name, "--image", var.image, "--region", var.gcp_region]
    }
  }
}

resource "google_cloud_run_service_iam_member" "deploy" {
  location = google_cloud_run_service.this.location
  project  = google_cloud_run_service.this.project
  service  = google_cloud_run_service.this.name
  role     = "roles/run.developer"
  member   = "serviceAccount:${google_service_account.this.email}"
}
