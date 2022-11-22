resource "google_storage_bucket" "home" {
  name = "mitbattlecode-home"

  location      = "US"
  storage_class = "STANDARD"

  website {
    main_page_suffix = "index.html"
  }
}

resource "google_storage_bucket_iam_member" "home" {
  bucket = google_storage_bucket.home.name
  role   = "roles/storage.legacyObjectReader"
  member = "allUsers"
}

module "cd" {
  source = "./cd"

  name        = "galaxy"
  gcp_project = var.gcp_project
  gcp_region  = var.gcp_region
  gcp_zone    = var.gcp_zone

  storage_frontend_name = module.production.storage_public_name
}

module "releases_maven" {
  source = "./maven"

  name        = "releases-maven"
  gcp_project = var.gcp_project
  gcp_region  = var.gcp_region
  gcp_zone    = var.gcp_zone

  depends_on = [
    google_project_service.artifactregistry,
  ]
}

module "production" {
  source      = "./galaxy"
  name        = "production"
  gcp_project = var.gcp_project
  gcp_region  = var.gcp_region
  gcp_zone    = var.gcp_zone

  mailjet_api_key    = var.mailjet_api_key
  mailjet_api_secret = var.mailjet_api_secret

  create_website               = true
  siarnaq_image                = module.cd.artifact_siarnaq_image
  database_tier                = "db-custom-1-3840"
  database_authorized_networks = []

  titan_image = module.cd.artifact_titan_image

  saturn_image          = module.cd.artifact_saturn_image
  max_compile_instances = 10
  max_execute_instances = 10

  depends_on = [
    google_project_service.artifactregistry,
    google_project_service.eventarc,
    google_project_service.run,
    google_project_service.secretmanager,
    google_project_service.sqladmin,
  ]
}

module "staging" {
  source      = "./galaxy"
  name        = "staging"
  gcp_project = var.gcp_project
  gcp_region  = var.gcp_region
  gcp_zone    = var.gcp_zone

  mailjet_api_key    = var.mailjet_api_key
  mailjet_api_secret = var.mailjet_api_secret

  create_website               = false
  siarnaq_image                = null
  database_tier                = "db-f1-micro"
  database_authorized_networks = ["0.0.0.0/0"]

  titan_image = module.cd.artifact_titan_image

  saturn_image          = module.cd.artifact_saturn_image
  max_compile_instances = 1
  max_execute_instances = 1

  depends_on = [
    google_project_service.artifactregistry,
    google_project_service.eventarc,
    google_project_service.run,
    google_project_service.secretmanager,
    google_project_service.sqladmin,
  ]
}

module "network" {
  source = "./network"

  name        = "galaxy-network"
  gcp_project = var.gcp_project
  gcp_region  = var.gcp_region
  gcp_zone    = var.gcp_zone

  managed_zone_name = "battlecode-dns-zone"
  domain            = "battlecode.org."

  cloudrun_service_name = module.production.run_service_name
  storage_home_name     = google_storage_bucket.home.name

  production_buckets = {
    public = {
      bucket_name = module.production.storage_public_name
      enable_cdn  = true
      paths       = ["/public", "/public/*"]
    }
    frontend = {
      bucket_name = module.production.storage_frontend_name
      enable_cdn  = true
      paths       = ["/*"]
    }
  }

  staging_buckets = {
  }

  dns_additional_records = {
    "db.staging." = module.staging.sql_instance_ip
  }
}
