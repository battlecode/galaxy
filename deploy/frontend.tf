resource "google_storage_bucket" "frontend" {
  name     = "frontend-mitbattlecode"
  location = var.gcp_region
  project  = var.gcp_project

  uniform_bucket_level_access = true
  # Permissions defined exactly in "google_storage_bucket_access_control"

  # TODO here: set index / home page etc
  # TODO here: set meta for each object for cache control. (Actually, upon investigating, that probably has to be done in deploy script? The meta has to be set for each _object_ within the bucket, not the bucket itself. It's impractical to terraform-ize each file of the bucket in the first place.)
}

resource "google_storage_bucket_access_control" "public_rule" {
  bucket = google_storage_bucket.frontend.name
  role   = "READER"
  entity = "allUsers"
}
