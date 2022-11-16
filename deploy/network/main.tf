resource "google_compute_region_network_endpoint_group" "serverless" {
  name   = "${var.name}-serverless"
  region = var.gcp_region

  network_endpoint_type = "SERVERLESS"

  cloud_run {
    service = var.cloudrun_service_name
  }
}

resource "google_compute_backend_bucket" "frontend" {
  name        = "${var.name}-frontend"
  bucket_name = var.storage_frontend_name
  enable_cdn  = true
}

resource "google_compute_backend_bucket" "production" {
  for_each = var.production_buckets

  name        = "${var.name}-production-${each.key}"
  bucket_name = each.value.bucket_name
  enable_cdn  = each.value.enable_cdn
}

resource "google_compute_backend_bucket" "staging" {
  for_each = var.staging_buckets

  name        = "${var.name}-staging-${each.key}"
  bucket_name = each.value.bucket_name
  enable_cdn  = each.value.enable_cdn
}

module "lb" {
  source  = "GoogleCloudPlatform/lb-http/google"
  version = "~> 6.0"

  project = var.gcp_project
  name    = var.name

  url_map        = google_compute_url_map.this.self_link
  create_url_map = false
  https_redirect = true

  ssl                             = true
  use_ssl_certificates            = false
  managed_ssl_certificate_domains = ["battlecode.org", "play.battlecode.org"]

  backends = {
    serverless = {
      description = "Serverless backend"
      protocol    = "HTTPS"
      port        = 443
      port_name   = "https"
      timeout_sec = 10
      enable_cdn  = false

      custom_request_headers  = null
      custom_response_headers = null
      security_policy         = null

      connection_draining_timeout_sec = null
      session_affinity                = null
      affinity_cookie_ttl_sec         = null

      health_check = {
        check_interval_sec  = null
        timeout_sec         = null
        healthy_threshold   = null
        unhealthy_threshold = null
        request_path        = "/api/ping"
        port                = 443
        host                = null
        logging             = null
      }

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

  default_service = google_compute_backend_bucket.frontend.self_link

  host_rule {
    hosts        = ["*"]
    path_matcher = "production"
  }

  host_rule {
    hosts        = ["staging.battlecode.org"]
    path_matcher = "staging"
  }

  path_matcher {
    name            = "production"
    default_service = google_compute_backend_bucket.frontend.self_link

    path_rule {
      paths = [
        "/api",
        "/api/*",
      ]
      service = module.lb.backend_services["serverless"].self_link
    }
    dynamic "path_rule" {
      for_each = var.production_buckets
      content {
        paths   = path_rule.value.paths
        service = google_compute_backend_bucket.production[path_rule.key].self_link
      }
    }
  }

  path_matcher {
    name            = "staging"
    default_service = google_compute_backend_bucket.frontend.self_link

    dynamic "path_rule" {
      for_each = var.staging_buckets
      content {
        paths   = path_rule.value.paths
        service = google_compute_backend_bucket.staging[path_rule.key].self_link
      }
    }
  }
}

resource "google_dns_managed_zone" "this" {
  name     = var.name
  dns_name = var.domain
}

resource "google_dns_record_set" "this" {
  name = google_dns_managed_zone.this.dns_name
  type = "A"
  ttl  = 300

  managed_zone = google_dns_managed_zone.this.name
  rrdatas      = [module.lb.external_ip]
}
