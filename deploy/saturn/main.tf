resource "google_service_account" "this" {
  account_id   = var.name
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

resource "google_storage_bucket_iam_member" "releases" {
  bucket = var.storage_releases_name
  role   = "roles/storage.objectViewer"
  member = "serviceAccount:${google_service_account.this.email}"
}

resource "google_artifact_registry_repository_iam_member" "this" {
  location   = var.gcp_region
  repository = var.artifact_registry_name
  role       = "roles/artifactregistry.reader"
  member     = "serviceAccount:${google_service_account.this.email}"
}

resource "google_project_iam_member" "log" {
  project = var.gcp_project
  role    = "roles/logging.logWriter"
  member  = "serviceAccount:${google_service_account.this.email}"
}

resource "google_project_iam_member" "monitoring" {
  project = var.gcp_project
  role    = "roles/monitoring.metricWriter"
  member  = "serviceAccount:${google_service_account.this.email}"
}

resource "google_pubsub_subscription" "queue" {
  name   = var.name
  topic  = var.pubsub_topic_name
  labels = var.labels

  ack_deadline_seconds    = 20
  enable_message_ordering = false  # Counterintuitive! See issue 514

  expiration_policy {
    ttl = ""
  }
}

resource "google_pubsub_subscription_iam_member" "queue" {
  subscription = google_pubsub_subscription.queue.name
  role         = "roles/pubsub.subscriber"
  member       = "serviceAccount:${google_service_account.this.email}"
}

resource "google_secret_manager_secret_iam_member" "this" {
  secret_id = var.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.this.email}"
}

resource "google_compute_subnetwork" "this" {
  name = var.name

  ip_cidr_range = var.subnetwork_ip_cidr
  region        = var.gcp_region
  network       = var.network_vpc_id
  stack_type    = "IPV4_ONLY"
}

# Google has deprecated the container startup agent (konlet), which is what reads the
# gce-container-declaration metadata key. Published dates: workflows relying on it stop working
# 2026-07-31, support ends entirely 2027-07-31. As of 2026-10-19 it still works here, but every
# Saturn worker is created on demand (min_instances = 0), so whenever enforcement lands, compile
# and execute stop together. Run the container from a systemd unit delivered by cloud-init
# instead, as recommended by
# https://cloud.google.com/compute/docs/containers/migrate-containers
locals {
  saturn_args = join(" ", [
    "-project=${var.gcp_project}",
    "-secret=${var.secret_id}",
    "-subscription=${google_pubsub_subscription.queue.name}",
    "-parallel=${var.parallelism}",
  ])

  # Restart=on-failure, not always: Saturn exits 0 when its context is cancelled by the
  # shutdown script, so a preempted worker stays down for the few seconds the VM has left
  # instead of claiming another job it cannot finish. A crash (exit 1) still restarts.
  cloud_init = <<-EOT
    #cloud-config

    write_files:
    - path: /etc/systemd/system/saturn.service
      permissions: "0644"
      owner: root
      content: |
        [Unit]
        Description=Saturn worker
        Wants=gcr-online.target
        After=gcr-online.target

        [Service]
        Environment="HOME=/home/saturn"
        ExecStartPre=/bin/mkdir -p /home/saturn
        ExecStartPre=/usr/bin/docker-credential-gcr configure-docker --registries=${var.gcp_region}-docker.pkg.dev
        ExecStart=/usr/bin/docker run --rm --name=saturn --network=host --log-driver=gcplogs ${var.image} ${local.saturn_args}
        ExecStop=/usr/bin/docker stop saturn
        Restart=on-failure
        RestartSec=10

        [Install]
        WantedBy=multi-user.target

    runcmd:
    - systemctl daemon-reload
    - systemctl start saturn.service
  EOT
}

resource "google_compute_instance_template" "this" {
  name_prefix  = "${var.name}-"
  region       = var.gcp_region
  machine_type = var.machine_type
  labels       = var.labels

  disk {
    boot         = true
    disk_size_gb = 10
    source_image = "projects/cos-cloud/global/images/family/cos-stable"
    auto_delete  = true
  }

  network_interface {
    subnetwork = google_compute_subnetwork.this.name

    access_config {}
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
    user-data                 = local.cloud_init
    google-logging-enabled    = true
    google-monitoring-enabled = true
    shutdown-script           = file("${path.module}/shutdown-script.sh")
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
      filter                     = "resource.type = pubsub_subscription AND resource.label.subscription_id = \"${google_pubsub_subscription.queue.name}\""
      single_instance_assignment = var.load_ratio
    }
  }

  depends_on = [
    google_pubsub_subscription.queue,
  ]
}
