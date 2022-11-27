resource "google_service_account" "this" {
  account_id   = var.name
  display_name = "Titan Agent"
  description  = "Service account for perform Titan actions"
}

resource "google_project_iam_member" "eventarc" {
  project = var.gcp_project
  role    = "roles/eventarc.eventReceiver"
  member  = "serviceAccount:${google_service_account.this.email}"
}

resource "google_storage_bucket_iam_member" "this" {
  for_each = toset(var.storage_names)

  bucket = each.value
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${google_service_account.this.email}"
}

data "google_storage_project_service_account" "gcs_account" {
}

resource "google_project_iam_member" "storage_pubsub" {
  project = var.gcp_project
  role    = "roles/pubsub.publisher"
  member  = "serviceAccount:${data.google_storage_project_service_account.gcs_account.email_address}"
}

resource "google_eventarc_trigger" "this" {
  for_each = toset(var.storage_names)

  name            = "${var.name}-${each.value}"
  location        = "us"
  service_account = google_service_account.this.email

  matching_criteria {
    attribute = "type"
    value     = "google.cloud.storage.object.v1.metadataUpdated"
  }

  matching_criteria {
    attribute = "bucket"
    value     = each.value
  }

  destination {
    cloud_run_service {
      service = google_cloud_run_service.this.name
      region = var.gcp_region
    }
  }

  depends_on = [
    google_project_iam_member.eventarc,
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
  }

  traffic {
    percent         = 100
    latest_revision = true
  }

  depends_on = [google_storage_bucket_iam_member.this]
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
      args = ["build", "--build-arg", "BUILD=$SHORT_SHA", "-t", var.image, "."]
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
