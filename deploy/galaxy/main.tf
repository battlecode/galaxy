resource "google_storage_bucket" "public" {
  name = "mitbattlecode-${var.name}-public"

  location      = var.gcp_region
  storage_class = "STANDARD"
}

resource "google_storage_bucket" "secure" {
  name = "mitbattlecode-${var.name}-secure"

  location      = var.gcp_region
  storage_class = "STANDARD"

  dynamic "lifecycle_rule" {
    for_each = var.secure_lifecycle_rules

    content {
      condition {
        age = lifecycle_rule.value.age
      }
      action {
        type = "SetStorageClass"
        storage_class = lifecycle_rule.value.storage_class
      }
    }
  }
}

resource "google_storage_bucket" "frontend" {
  count = var.create_website ? 1 : 0

  name = "mitbattlecode-${var.name}-frontend"

  location      = "US"
  storage_class = "STANDARD"
}

resource "google_storage_bucket_iam_member" "public" {
  bucket = google_storage_bucket.public.name
  role   = "roles/storage.legacyObjectReader"
  member = "allUsers"
}

resource "google_storage_bucket_iam_member" "frontend" {
  count = var.create_website ? 1 : 0

  bucket = google_storage_bucket.frontend[count.index].name
  role   = "roles/storage.legacyObjectReader"
  member = "allUsers"
}

resource "google_compute_network" "this" {
  name = "galaxy-${var.name}"

  auto_create_subnetworks = false
  routing_mode            = "REGIONAL"
}

module "siarnaq" {
  source = "../siarnaq"

  name        = "${var.name}-siarnaq"
  gcp_project = var.gcp_project
  gcp_region  = var.gcp_region
  gcp_zone    = var.gcp_zone

  create_cloud_run = var.create_website
  image            = var.siarnaq_image

  database_tier                = var.database_tier
  database_name                = "battlecode"
  database_user                = "siarnaq"
  database_authorized_networks = var.database_authorized_networks

  mailjet_api_key    = var.mailjet_api_key
  mailjet_api_secret = var.mailjet_api_secret

  storage_public_name = google_storage_bucket.public.name
  storage_secure_name = google_storage_bucket.secure.name

}

module "titan" {
  source = "../titan"

  name        = "${var.name}-titan"
  gcp_project = var.gcp_project
  gcp_region  = var.gcp_region
  gcp_zone    = var.gcp_zone

  image         = var.titan_image
  storage_names = [google_storage_bucket.public.name, google_storage_bucket.secure.name]
}

module "saturn_compile" {
  source = "../saturn"

  name        = "${var.name}-saturn-compile"
  gcp_project = var.gcp_project
  gcp_region  = var.gcp_region
  gcp_zone    = var.gcp_zone

  pubsub_topic_name   = module.siarnaq.topic_compile_name
  storage_public_name = google_storage_bucket.public.name
  storage_secure_name = google_storage_bucket.secure.name

  network_vpc_id = google_compute_network.this.id
  subnetwork_ip_cidr = "172.16.0.0/16"

  machine_type = "e2-medium"
  image        = var.saturn_image
  command      = "compile"

  max_instances = var.max_compile_instances
  min_instances = 0
  load_ratio    = 25
}

module "saturn_execute" {
  source = "../saturn"

  name        = "${var.name}-saturn-execute"
  gcp_project = var.gcp_project
  gcp_region  = var.gcp_region
  gcp_zone    = var.gcp_zone

  pubsub_topic_name   = module.siarnaq.topic_execute_name
  storage_public_name = google_storage_bucket.public.name
  storage_secure_name = google_storage_bucket.secure.name

  network_vpc_id = google_compute_network.this.id
  subnetwork_ip_cidr = "172.17.0.0/16"

  machine_type = "e2-highmem-2"
  image        = var.saturn_image
  command      = "execute"

  max_instances = var.max_execute_instances
  min_instances = 0
  load_ratio    = 10
}
