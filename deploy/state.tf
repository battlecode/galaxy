resource "google_storage_bucket" "tf_bucket" {
  name = "mitbattlecode-terraform-state"

  location      = "US"
  storage_class = "STANDARD"
  force_destroy = false

  versioning {
    enabled = true
  }
}

terraform {
  backend "gcs" {
    bucket = "mitbattlecode-terraform-state"
    prefix = "prod"
  }
}
