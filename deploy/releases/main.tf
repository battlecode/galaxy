resource "google_service_account" "this" {
  account_id   = "${var.name}-agent"
  display_name = "Releases Agent"
  description  = "Service account for performing releases"
}

resource "google_storage_bucket" "this" {
  name = "mitbattlecode-${var.name}"

  location      = "US"
  storage_class = "STANDARD"
}

resource "google_storage_bucket_iam_member" "this" {
  bucket = google_storage_bucket.this.name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${google_service_account.this.email}"
}

resource "google_storage_bucket_iam_member" "reader" {
  bucket  = google_storage_bucket.this.name
  role    = "roles/storage.legacyBucketReader"
  member  = "serviceAccount:${google_service_account.this.email}"
}

resource "google_iam_workload_identity_pool" "this" {
  workload_identity_pool_id = var.name
  description               = "Workload identity for releases"
}

resource "google_iam_workload_identity_pool_provider" "this" {
  workload_identity_pool_id          = google_iam_workload_identity_pool.this.workload_identity_pool_id
  workload_identity_pool_provider_id = "github-workflow"

  attribute_mapping = {
    "google.subject" = "assertion.sub"
  }
  attribute_condition = "assertion.repository_owner=='battlecode'"
  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com/"
  }
}

resource "google_service_account_iam_member" "this" {
  service_account_id = google_service_account.this.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/${google_iam_workload_identity_pool.this.name}/*"
}
