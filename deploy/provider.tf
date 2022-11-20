provider "google" {
  alias  = "impersonation"
  scopes = [
    "https://www.googleapis.com/auth/cloud-platform",
    "https://www.googleapis.com/auth/userinfo.email",
  ]
}

data "google_service_account_access_token" "default" {
  provider               = google.impersonation
  target_service_account = var.terraform_service_account
  scopes                 = ["userinfo-email", "cloud-platform"]
  lifetime               = "3600s"
}

provider "google" {
  project         = var.gcp_project
  access_token    = data.google_service_account_access_token.default.access_token
  request_timeout = "60s"
}

provider "google-beta" {
  project         = var.gcp_project
  access_token    = data.google_service_account_access_token.default.access_token
  request_timeout = "60s"
}

resource "google_project_service" "artifactregistry" {
  project = var.gcp_project
  service = "artifactregistry.googleapis.com"
  disable_dependent_services = true
}

resource "google_project_service" "eventarc" {
  project = var.gcp_project
  service = "eventarc.googleapis.com"
  disable_dependent_services = true
}

resource "google_project_service" "run" {
  project = var.gcp_project
  service = "run.googleapis.com"
  disable_dependent_services = true
}

resource "google_project_service" "secretmanager" {
  project = var.gcp_project
  service = "secretmanager.googleapis.com"
  disable_dependent_services = true
}

resource "google_project_service" "sqladmin" {
  project = var.gcp_project
  service = "sqladmin.googleapis.com"
  disable_dependent_services = true
}
