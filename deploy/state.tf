# this is for managing terraform state, which we store in the following bucket
# Note: if you're making a new project, you (probably) have to create this bucket first manually,
# before the rest of Terraform can work.

# Create a GCS Bucket
resource "google_storage_bucket" "tf-bucket" {
  provider = google

  project       = var.gcp_project
  name          = "terraform-state-mitbattlecode"
  location      = var.gcp_region
  force_destroy = true
  storage_class = "REGIONAL"
  versioning {
    enabled = true
  }
}
