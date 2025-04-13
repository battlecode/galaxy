resource "google_service_account" "this" {
  account_id   = "${var.name}-agent"
  display_name = "CPW Agent"
  description  = "Service account for performing CPW actions"
}

resource "tls_private_key" "ssh" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

# Create a secret for the SSH private key
resource "google_secret_manager_secret" "ssh_private_key" {
  secret_id = "${var.secret_id}"

  replication {
    automatic = true
  }
}

# Store the SSH private key in the secret
resource "google_secret_manager_secret_version" "ssh_private_key" {
  secret      = google_secret_manager_secret.ssh_private_key.id
  secret_data = tls_private_key.ssh.private_key_pem

  depends_on = [google_secret_manager_secret.ssh_private_key]
}

resource "google_project_iam_member" "log" {
  project = var.gcp_project
  role    = "roles/logging.logWriter"
  member  = "serviceAccount:${google_service_account.this.email}"

  depends_on = [google_service_account.this]
}

resource "google_project_iam_member" "monitoring" {
  project = var.gcp_project
  role    = "roles/monitoring.metricWriter"
  member  = "serviceAccount:${google_service_account.this.email}"

  depends_on = [google_service_account.this]
}

resource "google_secret_manager_secret_iam_member" "this" {
  secret_id = var.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.this.email}"

  depends_on = [
    google_service_account.this,
    google_secret_manager_secret.ssh_private_key
  ]
}

# Create an isolated VPC for the cpw VM
resource "google_compute_network" "cpw" {
  name                    = "${var.name}-vpc"
  auto_create_subnetworks = false
  routing_mode            = "REGIONAL"

  depends_on = [google_compute_network.cpw]
}

# Create a subnet within the isolated VPC
resource "google_compute_subnetwork" "this" {
  name          = var.name
  ip_cidr_range = var.subnetwork_ip_cidr
  region        = var.gcp_region
  network       = google_compute_network.cpw.id  # Use the new VPC
  stack_type    = "IPV4_ONLY"
}

# Create a static external IP
resource "google_compute_address" "static" {
  name   = "${var.name}-ip"
  region = var.gcp_region
}

# Allow SSH access
resource "google_compute_firewall" "ssh" {
  name    = "${var.name}-ssh"
  network = google_compute_network.cpw.id

  allow {
    protocol = "tcp"
    ports    = ["22"]
  }

  source_ranges = ["0.0.0.0/0"]  # Consider restricting this for security
  target_tags   = ["${var.name}-ssh"]

  depends_on = [google_compute_network.cpw]
}

# Allow websocket connections from cpw.battlecode.org
resource "google_compute_firewall" "websocket" {
  name    = "${var.name}-websocket"
  network = google_compute_network.cpw.id

  allow {
    protocol = "tcp"
    ports    = ["80", "443", "8080", "8001"]  # Adjust ports as needed for your websocket server
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["${var.name}-websocket"]
}

module "container" {
  source  = "terraform-google-modules/container-vm/google"
  version = "~> 2.0"

  container = {
    image = var.image
    args  = [
    ]
  }
}

resource "google_compute_instance" "this" {
  name         = var.name
  machine_type = var.machine_type
  zone         = var.gcp_zone
  tags         = ["${var.name}-ssh", "${var.name}-websocket"]
  labels       = var.labels

  boot_disk {
    initialize_params {
      image = module.container.source_image
      size  = var.disk_size
    }
  }

  network_interface {
    subnetwork = google_compute_subnetwork.this.name

    access_config {
      nat_ip = google_compute_address.static.address
    }
  }

  service_account {
    email  = google_service_account.this.email
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
    ssh-keys = "ubuntu:${tls_private_key.ssh.public_key_openssh}"
  }
    depends_on = [
    google_service_account.this,
    google_secret_manager_secret_iam_member.this,
    google_compute_subnetwork.this,
    google_compute_address.static,
    tls_private_key.ssh,
    google_secret_manager_secret_version.ssh_private_key
  ]
}
