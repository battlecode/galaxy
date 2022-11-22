locals {
  subdomains = concat(["", "www.", "api."], [for b in var.additional_buckets : b.subdomain])
}

resource "google_compute_region_network_endpoint_group" "serverless" {
  name   = "${var.name}-serverless"
  region = var.gcp_region

  network_endpoint_type = "SERVERLESS"

  cloud_run {
    service = var.cloudrun_service_name
  }
}

resource "google_compute_backend_bucket" "home" {
  name        = "${var.name}-home"
  bucket_name = var.storage_home_name
  enable_cdn  = true
}

resource "google_compute_backend_bucket" "buckets" {
  for_each = var.additional_buckets

  name        = "${var.name}-${each.key}"
  bucket_name = each.value.bucket_name
  enable_cdn  = each.value.enable_cdn
}

module "lb" {
  source  = "GoogleCloudPlatform/lb-http/google"
  version = "~> 6.0"

  project = var.gcp_project
  name    = var.name

  url_map           = google_compute_url_map.this.self_link
  create_url_map    = false
  https_redirect    = true
  firewall_networks = []

  ssl                             = true
  use_ssl_certificates            = false
  managed_ssl_certificate_domains = [for subdomain in local.subdomains : "${subdomain}battlecode.org" ]

  backends = {
    serverless = {
      description = "Serverless backend"
      protocol    = "HTTP"
      port        = 80
      port_name   = "http"
      timeout_sec = null
      enable_cdn  = false

      custom_request_headers  = null
      custom_response_headers = null
      security_policy         = null

      connection_draining_timeout_sec = null
      session_affinity                = null
      affinity_cookie_ttl_sec         = null

      health_check = null

      log_config = {
        enable = true
        sample_rate = 1.0
      }

      groups = [
        {
          group                        = google_compute_region_network_endpoint_group.serverless.id
          balancing_mode               = null
          capacity_scaler              = null
          description                  = null
          max_connections              = null
          max_connections_per_instance = null
          max_connections_per_endpoint = null
          max_rate                     = null
          max_rate_per_instance        = null
          max_rate_per_endpoint        = null
          max_utilization              = null
        }
      ]

      iap_config = {
        enable               = false
        oauth2_client_id     = null
        oauth2_client_secret = null
      }
    }
  }
}

resource "google_compute_url_map" "this" {
  name = var.name

  default_service = google_compute_backend_bucket.home.self_link

  host_rule {
    hosts        = ["api.battlecode.org"]
    path_matcher = "backend"
  }

  dynamic "host_rule" {
    for_each = var.additional_buckets
    iterator = bucket

    content {
      hosts        = ["${bucket.value.subdomain}battlecode.org"]
      path_matcher = bucket.key
    }
  }

  path_matcher {
    name            = "backend"
    default_service = module.lb.backend_services["serverless"].self_link
  }

  dynamic "path_matcher" {
    for_each = var.additional_buckets
    iterator = bucket

    content {
      name            = bucket.key
      default_service = google_compute_backend_bucket.buckets[bucket.key].self_link
    }
  }
}

data "google_dns_managed_zone" "this" {
  name = var.managed_zone_name
}

resource "google_dns_record_set" "this" {
  for_each = toset(local.subdomains)

  name = "${each.value}${data.google_dns_managed_zone.this.dns_name}"
  type = "A"
  ttl  = 300

  managed_zone = data.google_dns_managed_zone.this.name
  rrdatas      = [module.lb.external_ip]
}

resource "google_dns_record_set" "additional" {
  for_each = var.dns_additional_records

  name = "${each.key}${data.google_dns_managed_zone.this.dns_name}"
  type = "A"
  ttl  = 300

  managed_zone = data.google_dns_managed_zone.this.name
  rrdatas      = [each.value]
}
