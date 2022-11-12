resource "google_storage_bucket" "public" {
  name = "mitbattlecode-public"

  location      = "US"
  storage_class = "STANDARD"
}

resource "google_storage_bucket" "secure" {
  name = "mitbattlecode-secure"

  location      = "US"
  storage_class = "STANDARD"
}

resource "google_storage_bucket" "frontend" {
  name = "mitbattlecode-frontend"

  location      = "US"
  storage_class = "STANDARD"
}

resource "google_storage_bucket_access_control" "public" {
  bucket = google_storage_bucket.public.name
  role   = "READER"
  entity = "allUsers"
}

resource "google_storage_bucket_access_control" "frontend" {
  bucket = google_storage_bucket.frontend.name
  role   = "READER"
  entity = "allUsers"
}

resource "google_compute_network" "this" {
  name = "galaxy"

  auto_create_subnetworks = false
  routing_mode            = "REGIONAL"
}

module "galaxy_artifact" {
  source = "./artifact"

  name        = "galaxy"
  gcp_project = var.gcp_project
  gcp_region  = var.gcp_region
  gcp_zone    = var.gcp_zone

  storage_frontend_name = google_storage_bucket.frontend.name

  depends_on = [
    google_project_service.artifactregistry,
  ]
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

module "siarnaq" {
  source = "./siarnaq"

  name        = "siarnaq"
  gcp_project = var.gcp_project
  gcp_region  = var.gcp_region
  gcp_zone    = var.gcp_zone
  image       = module.galaxy_artifact.artifact_siarnaq_image

  database_name = "battlecode"
  database_user = "siarnaq"

  storage_public_name = google_storage_bucket.public.name
  storage_secure_name = google_storage_bucket.secure.name

  depends_on = [
    google_project_service.artifactregistry,
    google_project_service.run,
    google_project_service.secretmanager,
    google_project_service.sqladmin,
  ]
}

module "saturn_compile" {
  source = "./saturn"

  name        = "saturn-compile"
  gcp_project = var.gcp_project
  gcp_region  = var.gcp_region
  gcp_zone    = var.gcp_zone

  pubsub_topic_name   = module.siarnaq.topic_compile_name
  storage_public_name = google_storage_bucket.public.name
  storage_secure_name = google_storage_bucket.secure.name

  network_vpc_id = google_compute_network.this.id
  subnetwork_ip_cidr = "172.16.0.0/16"

  machine_type = "e2-medium"
  image        = module.galaxy_artifact.artifact_saturn_image
  command      = "compile"

  max_instances = 10
  min_instances = 0
  load_ratio    = 25

  depends_on = [
    google_project_service.artifactregistry,
  ]
}

module "saturn_execute" {
  source = "./saturn"

  name        = "saturn-execute"
  gcp_project = var.gcp_project
  gcp_region  = var.gcp_region
  gcp_zone    = var.gcp_zone

  pubsub_topic_name   = module.siarnaq.topic_execute_name
  storage_public_name = google_storage_bucket.public.name
  storage_secure_name = google_storage_bucket.secure.name

  network_vpc_id = google_compute_network.this.id
  subnetwork_ip_cidr = "172.17.0.0/16"

  machine_type = "e2-highmem-2"
  image        = "us-east1-docker.pkg.dev/mitbattlecode/galaxy/saturn"  # TODO make automatic
  command      = "execute"

  max_instances = 10
  min_instances = 0
  load_ratio    = 10

  depends_on = [
    google_project_service.artifactregistry,
  ]
}

module "web" {
  source = "./web"

  name        = "web"
  gcp_project = var.gcp_project
  gcp_region  = var.gcp_region
  gcp_zone    = var.gcp_zone

  cloudrun_service_name = module.siarnaq.run_service_name
  storage_public_name   = google_storage_bucket.public.name
  storage_frontend_name = google_storage_bucket.frontend.name
}
