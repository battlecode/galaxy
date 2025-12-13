module "cd" {
  source = "./cd"

  name        = "galaxy"
  gcp_project = var.gcp_project
  gcp_region  = var.gcp_region
  gcp_zone    = var.gcp_zone
  labels      = merge(var.labels, {environment="shared", component="cd"})

  storage_frontend_name = module.production.storage_public_name
}

module "releases" {
  source = "./releases"

  name        = "releases"
  gcp_project = var.gcp_project
  gcp_region  = var.gcp_region
  gcp_zone    = var.gcp_zone
  labels      = merge(var.labels, {environment="shared", component="releases"})

  depends_on = [null_resource.apis]
}

module "production" {
  source      = "./galaxy"
  name        = "production"
  gcp_project = var.gcp_project
  gcp_region  = var.gcp_region
  gcp_zone    = var.gcp_zone
  labels      = merge(var.labels, {environment="production"})

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
  siarnaq_secrets              = merge(var.siarnaq_secrets_common, var.siarnaq_secrets_production)

  artifact_registry_name = module.cd.artifact_registry_name

  titan_image = module.cd.artifact_image["titan"]

  saturn_image          = module.cd.artifact_image["saturn"]
  min_compile_instances = 0
  max_compile_instances = 5
  min_execute_instances = 0
  max_execute_instances = 10
  saturn_secrets        = var.saturn_secrets_production
  storage_releases_name = module.releases.storage_bucket_name

  siarnaq_trigger_tag_pattern  = "^siarnaq-backend-.*"
  frontend_trigger_tag_pattern = "^siarnaq-frontend-.*"
  titan_trigger_tag_pattern    = "^titan-.*"
  saturn_trigger_tag_pattern   = "^saturn-.*"

  depends_on = [null_resource.apis]
}

module "staging" {
  source      = "./galaxy"
  name        = "staging"
  gcp_project = var.gcp_project
  gcp_region  = var.gcp_region
  gcp_zone    = var.gcp_zone
  labels      = merge(var.labels, {environment="staging"})

  secure_lifecycle_rules = []

  create_website               = false
  siarnaq_image                = module.cd.artifact_image["siarnaq"]
  siarnaq_configuration        = "Staging"
  database_tier                = "db-f1-micro"
  database_backup              = false
  database_authorized_networks = ["0.0.0.0/0"]
  siarnaq_secrets              = merge(var.siarnaq_secrets_common, var.siarnaq_secrets_staging)

  artifact_registry_name = module.cd.artifact_registry_name

  titan_image = module.cd.artifact_image["titan"]

  saturn_image          = module.cd.artifact_image["saturn"]
  min_compile_instances = 0
  max_compile_instances = 1
  min_execute_instances = 0
  max_execute_instances = 1
  saturn_secrets        = var.saturn_secrets_staging
  storage_releases_name = module.releases.storage_bucket_name

  siarnaq_trigger_tag_pattern  = "^(staging-)?siarnaq-.*"
  frontend_trigger_tag_pattern = "^(staging-)?frontend-.*"
  titan_trigger_tag_pattern    = "^(staging-)?titan-.*"
  saturn_trigger_tag_pattern   = "^(staging-)?saturn-.*"

  depends_on = [null_resource.apis]
}

module "production_network" {
  source = "./network"

  name        = "production"
  gcp_project = var.gcp_project
  gcp_region  = var.gcp_region
  gcp_zone    = var.gcp_zone
  labels      = merge(var.labels, {environment="production", component="network"})

  https_redirect        = true
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
  labels      = merge(var.labels, {environment="staging", component="network"})

  https_redirect        = false
  subdomain             = "staging."
  cloudrun_service_name = module.staging.run_service_name
  sql_instance_ip       = module.staging.sql_instance_ip

  additional_buckets = {}
}

module "cpw" {
  source      = "./cpw"
  name        = "cpw"
  gcp_project = var.gcp_project
  gcp_region  = var.gcp_region
  gcp_zone    = var.gcp_zone
  labels      = merge(var.labels, {environment="production", component="cpw"})

  # network_vpc_id      = module.production_network.vpc_id
  subnetwork_ip_cidr  = "10.0.4.0/24"
  secret_id           = "cpw-ssh-key"
  machine_type        = "n2-standard-4" #4 vCPUs, 16GB RAM
  image               = "projects/ubuntu-os-cloud/global/images/family/ubuntu-2204-lts"
  disk_size           = 50
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
      module.cpw.dns_records
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
