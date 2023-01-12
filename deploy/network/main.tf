locals {
  subsubdomains = concat(["api."], [for b in var.additional_buckets : b.subsubdomain])
  subdomains = [ for subsubdomain in local.subsubdomains : "${subsubdomain}${var.subdomain}" ]
}

resource "google_compute_region_network_endpoint_group" "siarnaq" {
  name   = "${var.name}-siarnaq"
  region = var.gcp_region

  network_endpoint_type = "SERVERLESS"

  cloud_run {
    service = var.cloudrun_service_name
  }
}

resource "google_compute_backend_bucket" "buckets" {
  for_each = var.additional_buckets

  name        = "${var.name}-${each.key}"
  bucket_name = each.value.bucket_name
  enable_cdn  = each.value.enable_cdn

  cdn_policy {
    cache_mode         = "CACHE_ALL_STATIC"
    default_ttl        = each.value.cdn_cache_ttl
    max_ttl            = each.value.cdn_cache_ttl
    client_ttl         = each.value.cdn_cache_ttl
    request_coalescing = true
  }
}

module "lb" {
  source  = "GoogleCloudPlatform/lb-http/google"
  version = "~> 6.0"

  project = var.gcp_project
  name    = var.name

  url_map           = google_compute_url_map.this.self_link
  create_url_map    = false
  https_redirect    = var.https_redirect
  firewall_networks = []

  ssl                             = true
  use_ssl_certificates            = false
  managed_ssl_certificate_domains = [for subdomain in local.subdomains : "${subdomain}battlecode.org" ]

  backends = {
    siarnaq = {
      description = "Siarnaq"
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
          group                        = google_compute_region_network_endpoint_group.siarnaq.id
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

  default_service = module.lb.backend_services["siarnaq"].self_link

  dynamic "host_rule" {
    for_each = var.additional_buckets
    iterator = bucket

    content {
      hosts        = ["${bucket.value.subsubdomain}battlecode.org"]
      path_matcher = bucket.key
    }
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
