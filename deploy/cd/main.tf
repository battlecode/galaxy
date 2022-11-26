resource "google_artifact_registry_repository" "this" {
  repository_id = var.name
  project       = var.gcp_project
  location      = var.gcp_region
  format        = "DOCKER"
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
