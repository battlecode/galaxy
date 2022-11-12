resource "google_compute_region_network_endpoint_group" "serverless" {
  name   = "${var.name}-serverless"
  region = var.gcp_region

  network_endpoint_type = "SERVERLESS"

  cloud_run {
    service = var.cloudrun_service_name
  }
}

resource "google_compute_backend_bucket" "public" {
  name = "${var.name}-public"

  bucket_name = var.storage_public_name
  enable_cdn  = true
}

resource "google_compute_backend_bucket" "frontend" {
  name = "${var.name}-frontend"

  bucket_name = var.storage_frontend_name
  enable_cdn  = true
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
    path_matcher = "allpaths"
  }

  path_matcher {
    name = "allpaths"
    default_service = google_compute_backend_bucket.frontend.self_link

    path_rule {
      paths = [
        "/api",
        "/api/*",
      ]
      service = module.lb.backend_services["serverless"].self_link
    }
    path_rule {
      paths = [
        "/public",
        "/public/*",
      ]
      service = google_compute_backend_bucket.public.self_link
    }
  }
}

# resource "google_dns" "this" {
# }
