resource "google_artifact_registry_repository" "this" {
  repository_id = var.name
  project       = var.gcp_project
  location      = var.gcp_region
  format        = "DOCKER"
}

locals {
  siarnaq_image = "${google_artifact_registry_repository.this.location}-docker.pkg.dev/${google_artifact_registry_repository.this.project}/${google_artifact_registry_repository.this.repository_id}/siarnaq"
  titan_image = "${google_artifact_registry_repository.this.location}-docker.pkg.dev/${google_artifact_registry_repository.this.project}/${google_artifact_registry_repository.this.repository_id}/titan"
  saturn_image = "${google_artifact_registry_repository.this.location}-docker.pkg.dev/${google_artifact_registry_repository.this.project}/${google_artifact_registry_repository.this.repository_id}/saturn"
}

resource "google_cloudbuild_trigger" "home" {
  name     = "${var.name}-home"
  filename = "cloudbuild.yaml"

  github {
    owner = "battlecode"
    name  = "battlecode.org"
    push {
      branch = "^(main|master)$"
    }
  }
}

resource "google_cloudbuild_trigger" "galaxy" {
  name     = "${var.name}-galaxy"

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
      dir  = "backend"
    }

    step {
      name = "gcr.io/cloud-builders/docker"
      args = ["build", "-t", local.titan_image, "."]
      dir  = "titan"
    }

    images = [
      local.siarnaq_image,
      local.titan_image,
    ]
  }
}
