locals {
  pubsub_topics = toset(["antivirus", "compile", "execute"])
}

resource "google_service_account" "this" {
  account_id   = "${var.name}-agent"
  display_name = "Siarnaq Agent"
  description  = "Service account for performing Siarnaq actions"
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

resource "google_project_iam_member" "scheduler" {
  project = var.gcp_project
  role    = "roles/cloudscheduler.admin"
  member  = "serviceAccount:${google_service_account.this.email}"
}

resource "google_project_iam_member" "sql" {
  count = var.create_cloud_run ? 1 : 0

  project = var.gcp_project
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.this.email}"
}

resource "google_pubsub_topic" "this" {
  for_each = local.pubsub_topics

  name = "${var.name}-${each.value}"
}

resource "google_pubsub_topic_iam_member" "this" {
  for_each = local.pubsub_topics

  topic  = google_pubsub_topic.this[each.key].name
  role   = "roles/pubsub.publisher"
  member = "serviceAccount:${google_service_account.this.email}"
}

resource "google_sql_database_instance" "this" {
  name             = "${var.name}-db"
  region           = var.gcp_region
  database_version = "POSTGRES_14"

  settings {
    tier = var.database_tier

    ip_configuration {
      ipv4_enabled = true

      dynamic authorized_networks {
        for_each = var.database_authorized_networks
        iterator = network
        content {
          value = network.value
        }
      }
    }

    location_preference {
      zone = var.gcp_zone
    }
  }
}

resource "google_sql_database" "this" {
  name     = var.database_name
  instance = google_sql_database_instance.this.name
}

resource "random_password" "db_password" {
  length = 24
}

resource "google_sql_user" "this" {
  name     = var.database_user
  instance = google_sql_database_instance.this.name
  password = random_password.db_password.result
}

resource "google_secret_manager_secret" "this" {
  secret_id = "${var.name}-db-password"

  replication {
    automatic = true
  }
}

resource "google_secret_manager_secret_version" "this" {
  secret = google_secret_manager_secret.this.id

  secret_data = random_password.db_password.result
}

resource "google_secret_manager_secret_iam_member" "this" {
  secret_id = google_secret_manager_secret.this.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.this.email}"
}

resource "google_cloud_run_service" "this" {
  count    = var.create_cloud_run ? 1 : 0
  name     = var.name
  location = var.gcp_region

  template {
    spec {
      service_account_name = google_service_account.this.email

      containers {
        image = var.image

        env {
          name = "SIARNAQ_SECRET"
          value_from {
            secret_key_ref {
              key  = "latest"
              name = google_secret_manager_secret.this.secret_id
            }
          }
        }
      }
    }
    metadata {
      annotations = {
        "run.googleapis.com/cloudsql-instances" = google_sql_database_instance.this.connection_name
        "run.googleapis.com/client-name"        = "terraform"
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }

  depends_on = [
    google_storage_bucket_iam_member.public,
    google_storage_bucket_iam_member.secure,
    google_pubsub_topic_iam_member.this,
    google_sql_database.this,
    google_sql_user.this,
    google_secret_manager_secret_version.this,
    google_secret_manager_secret_iam_member.this,
  ]
}

data "google_iam_policy" "noauth" {
  binding {
    role    = "roles/run.invoker"
    members = ["allUsers"]
  }
}

resource "google_cloud_run_service_iam_policy" "noauth" {
  count = var.create_cloud_run ? 1 : 0

  location    = google_cloud_run_service.this[count.index].location
  project     = google_cloud_run_service.this[count.index].project
  service     = google_cloud_run_service.this[count.index].name
  policy_data = data.google_iam_policy.noauth.policy_data
}
