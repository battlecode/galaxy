resource "google_artifact_registry_repository" "this" {
  repository_id = var.name
  project       = var.gcp_project
  location      = var.gcp_region
  labels        = var.labels
  format        = "DOCKER"
}
