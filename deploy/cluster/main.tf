resource "google_compute_network" "this" {
  name = "${var.name}-vpc"
  auto_create_subnetworks = false
  routing_mode = "REGIONAL"
}

resource "google_compute_subnetwork" "this" {
  name = var.name
  network = google_compute_network.this.id
}

resource "google_container_cluster" "this" {
  name = "${var.name}-cluster"
  location = var.gcp_zone # zonal cluster avoids data transfer costs between zones
  remove_default_node_pool = true
  initial_node_count = 1
  network = google_compute_network.this.self_link
  subnetwork = google_compute_subnetwork.this.self_link
  networking_mode = "VPC_NATIVE"
  deletion_protection = true

  addons_config {
    http_load_balancing {
      disabled = false
    }
    horizontal_pod_autoscaling {
      disabled = false
    }
  }

  release_channel {
    channel = "STABLE"
  }

  workload_identity_config {
    workload_pool = "${}"
  }

  ip_allocation_policy {
    cluster_secondary_range_name = "k8s-pods"
    services_secondary_range_name = "k8s-services"
  }

  private_cluster_config {
    enable_private_nodes = true
    enable_private_endpoint = false
    master_ipv4_cidr_block = "192.168.0.0/28"
  }
}
