module "cd" {
  source = "./cd"

  name        = "galaxy"
  gcp_project = var.gcp_project
  gcp_region  = var.gcp_region
  gcp_zone    = var.gcp_zone

  storage_frontend_name = module.production.storage_public_name
}

module "releases" {
  source = "./releases"

  name        = "releases"
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
  siarnaq_configuration        = "Production"
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
  siarnaq_image                = module.cd.artifact_image["siarnaq"]
  siarnaq_configuration        = "Staging"
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

module "production_network" {
  source = "./network"

  name        = "production"
  gcp_project = var.gcp_project
  gcp_region  = var.gcp_region
  gcp_zone    = var.gcp_zone

  use_ssl               = true
  subdomain             = ""
  cloudrun_service_name = module.production.run_service_name
  sql_instance_ip       = module.production.sql_instance_ip

  additional_buckets = {
    "frontend" = {
      bucket_name   = module.production.storage_frontend_name
      enable_cdn    = true
      cdn_cache_ttl = 60
      subsubdomain  = "play."
    }
    "releases" = {
      bucket_name   = module.releases.storage_bucket_name
      enable_cdn    = true
      cdn_cache_ttl = 60
      subsubdomain  = "releases."
    }
  }
}

module "staging_network" {
  source = "./network"

  name        = "staging"
  gcp_project = var.gcp_project
  gcp_region  = var.gcp_region
  gcp_zone    = var.gcp_zone

  use_ssl               = false
  subdomain             = "staging."
  cloudrun_service_name = module.staging.run_service_name
  sql_instance_ip       = module.staging.sql_instance_ip

  additional_buckets = {}
}

data "google_dns_managed_zone" "this" {
  name = "battlecode-dns-zone"
}


locals {
  dns_records = concat(
    module.production_network.dns_records,
    module.staging_network.dns_records,
    [
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
    ]
  )
}

resource "google_dns_record_set" "this" {
  for_each = { for record in local.dns_records : "${record.subdomain}/${record.type}" => record }

  name = "${each.value.subdomain}${data.google_dns_managed_zone.this.dns_name}"
  type = each.value.type
  ttl  = 300

  managed_zone = data.google_dns_managed_zone.this.name
  rrdatas      = each.value.rrdatas
}
