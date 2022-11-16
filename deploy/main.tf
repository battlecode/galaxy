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

  create_website = true
  siarnaq_image  = module.cd.artifact_siarnaq_image
  database_tier  = "db-custom-1-3840"

  saturn_image          = module.cd.artifact_saturn_image
  max_compile_instances = 10
  max_execute_instances = 10

  depends_on = [
    google_project_service.artifactregistry,
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

  create_website = false
  siarnaq_image  = null
  database_tier  = "db-f1-micro"

  saturn_image          = module.cd.artifact_saturn_image
  max_compile_instances = 1
  max_execute_instances = 1

  depends_on = [
    google_project_service.artifactregistry,
    google_project_service.run,
    google_project_service.secretmanager,
    google_project_service.sqladmin,
  ]
}

module "network" {
  source = "./network"

  name        = "network"
  gcp_project = var.gcp_project
  gcp_region  = var.gcp_region
  gcp_zone    = var.gcp_zone

  cloudrun_service_name = module.production.run_service_name
  storage_frontend_name = module.production.storage_frontend_name

  production_buckets = {
    public = {
      bucket_name = module.production.storage_public_name
      enable_cdn  = true
      paths       = ["/public", "/public/*"]
    }
  }

  staging_buckets = {
    public = {
      bucket_name = module.staging.storage_public_name
      enable_cdn  = false
      paths       = ["/public", "/public/*"]
    }
  }
}
