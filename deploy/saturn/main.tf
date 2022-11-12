resource "google_service_account" "this" {
  account_id   = "${var.name}-agent"
  display_name = "Saturn Agent"
  description  = "Service account for performing Saturn actions"
}

resource "google_storage_bucket_iam_member" "public" {
  bucket = var.storage_public_name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${google_service_account.this.email}"
}

resource "google_storage_bucket_iam_member" "secure" {
  bucket = var.storage_secure_name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${google_service_account.this.email}"
}

resource "google_pubsub_subscription" "queue" {
  name  = var.name
  topic = var.pubsub_topic_name

  ack_deadline_seconds    = 60
  enable_message_ordering = true

  expiration_policy {
    ttl = ""
  }
}

resource "google_pubsub_subscription_iam_member" "queue" {
  subscription = google_pubsub_subscription.queue.name
  role         = "roles/pubsub.subscriber"
  member       = "serviceAccount:${google_service_account.this.email}"
}

resource "google_compute_subnetwork" "this" {
  name = var.name

  ip_cidr_range = var.subnetwork_ip_cidr
  region        = var.gcp_region
  network       = var.network_vpc_id
  stack_type    = "IPV4_ONLY"
}

module "container" {
  source  = "terraform-google-modules/container-vm/google"
  version = "~> 2.0"

  container = {
    image = var.image
    args = [var.command]
  }
}

resource "google_compute_instance_template" "this" {
  name_prefix  = "${var.name}-"
  region       = var.gcp_region
  machine_type = var.machine_type

  disk {
    boot         = true
    disk_size_gb = 10
    source_image = module.container.source_image
    auto_delete  = true
  }

  network_interface {
    network = "default"

    access_config {}
  }

  network_interface {
    subnetwork = google_compute_subnetwork.this.name
  }

  service_account {
    email = google_service_account.this.email
    scopes = ["cloud-platform"]
  }

  scheduling {
    automatic_restart   = false
    on_host_maintenance = "TERMINATE"
    preemptible         = true
  }

  metadata = {
    gce-container-declaration = module.container.metadata_value
    google-logging-enabled    = true
    google-monitoring-enabled = true
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "google_compute_instance_group_manager" "this" {
  name = var.name
  zone = var.gcp_zone

  base_instance_name = var.name

  version {
    name              = var.name
    instance_template = google_compute_instance_template.this.id
  }

  depends_on = [
    google_storage_bucket_iam_member.public,
    google_storage_bucket_iam_member.secure,
    google_pubsub_subscription_iam_member.queue,
  ]
}

resource "google_compute_autoscaler" "this" {
  provider = google-beta

  name   = var.name
  zone   = var.gcp_zone
  target = google_compute_instance_group_manager.this.id

  autoscaling_policy {
    max_replicas    = var.max_instances
    min_replicas    = var.min_instances
    cooldown_period = 60

    metric {
      name                       = "pubsub.googleapis.com/subscription/num_undelivered_messages"
      filter                     = "resource.type = pubsub_subscription AND resource.label.subscription_id = \"${google_pubsub_subscription.queue.id}\""
      single_instance_assignment = var.load_ratio
    }
  }

  depends_on = [
    google_pubsub_subscription.queue,
  ]
}
