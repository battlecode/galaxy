resource "google_storage_bucket" "public" {
  name = "mitbattlecode-${var.name}-public"

  location      = var.gcp_region
  storage_class = "STANDARD"

  cors {
    origin          = ["*"]
    method          = ["GET", "HEAD", "OPTIONS"]
    response_header = ["*"]
    max_age_seconds = 3600
  }
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

  website {
    main_page_suffix = "index.html"
    not_found_page   = "index.html"
  }
}

resource "google_cloudbuild_trigger" "this" {
  count = var.create_website ? 1 : 0

  name            = "${var.name}-frontend"

  github {
    owner = "battlecode"
    name  = "galaxy"

    push {
      tag = "^siarnaq-frontend-.*"
    }
  }

  build {
    step {
      name = "node"
      entrypoint = "npm"
      args = ["install"]
      dir = "frontend"
    }
    step {
      name = "node"
      entrypoint = "npm"
      args = ["run", "build"]
      dir = "frontend"
      env = ["REACT_APP_REVISION=$SHORT_SHA"]
    }
    step {
      name = "gcr.io/google.com/cloudsdktool/cloud-sdk"
      entrypoint = "gsutil"
      # Don't delete old files;
      # those files may be requested by a user's cache or by CDN cache.
      args = ["-m", "rsync", "-r", "build", "gs://${google_storage_bucket.frontend[count.index].name}"]
      dir = "frontend"
    }
  }
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

  image            = var.siarnaq_image

  database_tier                = var.database_tier
  database_name                = "battlecode"
  database_user                = "siarnaq"
  database_backup              = var.database_backup
  database_authorized_networks = var.database_authorized_networks
  additional_secrets           = var.additional_secrets

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
