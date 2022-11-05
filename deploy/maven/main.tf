resource "google_artifact_registry_repository" "this" {
  repository_id = var.name
  project       = var.gcp_project
  location      = var.gcp_region
  format        = "MAVEN"
}

resource "google_artifact_registry_repository_iam_member" "public" {
  project    = var.gcp_project
  location   = var.gcp_region
  repository = google_artifact_registry_repository.this.name
  role       = "roles/artifactregistry.reader"
  member     = "allUsers"
}
