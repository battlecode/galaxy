resource "google_artifact_registry_repository" "this" {
  repository_id = var.name
  project       = var.gcp_project
  location      = var.gcp_region
  format        = "DOCKER"
}

locals {
  siarnaq_image = "${google_artifact_registry_repository.this.location}-docker.pkg.dev/${google_artifact_registry_repository.this.project}/${google_artifact_registry_repository.this.repository_id}/siarnaq"
  saturn_image = "${google_artifact_registry_repository.this.location}-docker.pkg.dev/${google_artifact_registry_repository.this.project}/${google_artifact_registry_repository.this.repository_id}/saturn"
}

resource "google_cloudbuild_trigger" "this" {
  name     = var.name
  location = var.gcp_region

  github {
    owner = "battlecode"
    name  = "galaxy"

    push {
      tag = "^release-.*"
    }
  }

  build {
    step {
      name = "gcr.io/cloud-builders/docker"
      args = ["build", "-t", local.siarnaq_image, "."]
      dir  = "siarnaq"
    }

    step {
      name = "gcr.io/cloud-builders/docker"
      args = ["build", "-t", local.saturn_image, "."]
      dir  = "saturn"
    }

    step {
      name = "gcr.io/cloud-builders/gsutil"
      args = ["rsync", "-r", "-c", "-d", ".", "gs://${var.storage_frontend_name}"]
      dir  = "frontend"
    }

    images = [
      local.siarnaq_image,
      local.saturn_image,
    ]
  }
}
