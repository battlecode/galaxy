resource "google_storage_bucket" "home" {
  name = "mitbattlecode-home"

  location      = "US"
  storage_class = "STANDARD"

  website {
    main_page_suffix = "index.html"
    not_found_page   = "404.html"
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

  secure_lifecycle_rules = [
    { age = 60, storage_class = "COLDLINE" },
    { age = 700, storage_class = "ARCHIVE" },
  ]

  create_website               = true
  siarnaq_image                = module.cd.artifact_image["siarnaq"]
  database_tier                = "db-custom-1-3840"
  database_backup              = true
  database_authorized_networks = []
  additional_secrets           = merge(var.additional_secrets_common, var.additional_secrets_production)

  titan_image = module.cd.artifact_image["titan"]

  saturn_image          = module.cd.artifact_image["saturn"]
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

  secure_lifecycle_rules = []

  create_website               = false
  siarnaq_image                = null
  database_tier                = "db-f1-micro"
  database_backup              = false
  database_authorized_networks = ["0.0.0.0/0"]
  additional_secrets           = merge(var.additional_secrets_common, var.additional_secrets_staging)

  titan_image = module.cd.artifact_image["titan"]

  saturn_image          = module.cd.artifact_image["saturn"]
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

  additional_buckets = {
    "production-frontend" = {
      bucket_name   = module.production.storage_frontend_name
      enable_cdn    = true
      cdn_cache_ttl = 60
      subdomain     = "play."
    }
  }

  dns_additional_records = [
    {
      type      = "A",
      subdomain = "",
      rrdatas   = [
        "185.199.108.153",  # These are GH Pages
        "185.199.109.153",
        "185.199.110.153",
        "185.199.111.153",
      ],
    },
    {
      type      = "CNAME",
      subdomain = "www.",
      rrdatas   = ["battlecode.org."],
    },
    {
      type      = "A",
      subdomain = "db.staging.",
      rrdatas   = [module.staging.sql_instance_ip],
    },
  ]
}
