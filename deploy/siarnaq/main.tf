locals {
  pubsub_topics = toset(["compile", "execute"])
}

resource "google_service_account" "this" {
  account_id   = "${var.name}-agent"
  display_name = "Siarnaq Agent"
  description  = "Service account for performing Siarnaq actions"
}

resource "google_service_account_iam_member" "sign" {
  service_account_id = google_service_account.this.name
  role               = "roles/iam.serviceAccountTokenCreator"
  member             = "serviceAccount:${google_service_account.this.email}"
}

resource "google_service_account_iam_member" "actas" {
  service_account_id = google_service_account.this.name
  role               = "roles/iam.serviceAccountUser"
  member             = "serviceAccount:${google_service_account.this.email}"
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

resource "google_storage_bucket_iam_member" "ephemeral" {
  bucket = var.storage_ephemeral_name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${google_service_account.this.email}"
}

resource "google_project_iam_member" "scheduler" {
  project = var.gcp_project
  role    = "roles/cloudscheduler.admin"
  member  = "serviceAccount:${google_service_account.this.email}"
}

resource "google_project_iam_member" "sql" {
  project = var.gcp_project
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.this.email}"
}

resource "google_pubsub_topic" "this" {
  for_each = local.pubsub_topics

  name   = "${var.name}-${each.value}"
  labels = var.labels
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
    user_labels = var.labels
    tier        = var.database_tier

    backup_configuration {
      enabled = var.database_backup
      start_time = "09:00"
    }

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

resource "random_password" "django_key" {
  length = 50
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
  secret_id = var.name
  labels    = var.labels

  replication {
    automatic = true
  }
}

resource "google_secret_manager_secret_version" "this" {
  secret = google_secret_manager_secret.this.id

  secret_data = jsonencode(merge({
    "django-key" : random_password.django_key.result,
    "db-password" : random_password.db_password.result
  }, var.additional_secrets))
}

resource "google_secret_manager_secret_iam_member" "this" {
  secret_id = google_secret_manager_secret.this.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.this.email}"
}

resource "google_cloud_run_service" "this" {
  name     = var.name
  location = var.gcp_region

  template {
    spec {
      service_account_name  = google_service_account.this.email
      container_concurrency = 4

      containers {
        image = var.image

        resources {
          limits = {
            cpu    = "2000m"
            memory = "2Gi"
          }
        }

        env {
          name = "DJANGO_CONFIGURATION"
          value = var.configuration
        }

        env {
          name = "SIARNAQ_SECRETS_JSON"
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
      labels = var.labels
    }
  }

  metadata {
    annotations = {
      "run.googleapis.com/ingress"      = "internal-and-cloud-load-balancing"
    }
  }

  autogenerate_revision_name = true

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

  lifecycle {
    ignore_changes = [
      metadata[0].annotations["client.knative.dev/user-image"],
      metadata[0].annotations["run.googleapis.com/client-name"],
      metadata[0].annotations["run.googleapis.com/client-version"],
      metadata[0].annotations["run.googleapis.com/operation-id"],
      template[0].metadata[0].annotations["client.knative.dev/user-image"],
      template[0].metadata[0].annotations["run.googleapis.com/client-name"],
      template[0].metadata[0].annotations["run.googleapis.com/client-version"],
    ]
  }
}

resource "google_cloud_run_service_iam_member" "noauth" {
  location = google_cloud_run_service.this.location
  project  = google_cloud_run_service.this.project
  service  = google_cloud_run_service.this.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

resource "google_cloud_tasks_queue" "rating" {
  name     = "${var.name}-rating"
  location = var.gcp_region

  rate_limits {
    max_concurrent_dispatches = 3
    max_dispatches_per_second = 10
  }
}

resource "google_cloud_tasks_queue_iam_member" "rating" {
  location = var.gcp_region
  name     = google_cloud_tasks_queue.rating.name
  role     = "roles/cloudtasks.enqueuer"
  member   = "serviceAccount:${google_service_account.this.email}"
}

resource "google_cloud_tasks_queue" "bracket" {
  name     = "${var.name}-bracket"
  location = var.gcp_region

  rate_limits {
    max_concurrent_dispatches = 3
    max_dispatches_per_second = 10
  }
}

resource "google_cloud_tasks_queue_iam_member" "bracket" {
  location = var.gcp_region
  name     = google_cloud_tasks_queue.bracket.name
  role     = "roles/cloudtasks.enqueuer"
  member   = "serviceAccount:${google_service_account.this.email}"
}

resource "google_cloudbuild_trigger" "this" {
  name            = var.name

  github {
    owner = "battlecode"
    name  = "galaxy"

    push {
      tag = "^siarnaq-backend-.*"
    }
  }

  build {
    step {
      name = "gcr.io/cloud-builders/docker"
      args = ["build", "--build-arg", "REVISION_ARG=$TAG_NAME+$SHORT_SHA.$BUILD_ID", "-t", var.image, "."]
      dir  = "backend"
    }
    step {
      name = "gcr.io/cloud-builders/docker"
      args = ["push", var.image]
    }
    step {
      name = "gcr.io/google-appengine/exec-wrapper"
      args = ["-i", var.image, "-e", "DJANGO_CONFIGURATION=${var.configuration}", "-s", "${var.gcp_project}:${var.gcp_region}:${google_sql_database_instance.this.name}", "--", "/env/bin/python", "manage.py", "migrate"]
    }
    step {
      name = "gcr.io/google-appengine/exec-wrapper"
      args = ["-i", var.image, "-e", "DJANGO_CONFIGURATION=${var.configuration}", "-s", "${var.gcp_project}:${var.gcp_region}:${google_sql_database_instance.this.name}", "--", "/env/bin/python", "manage.py", "collectstatic", "--verbosity=2", "--no-input"]
    }
    step {
      name = "gcr.io/google.com/cloudsdktool/cloud-sdk"
      entrypoint = "gcloud"
      args = ["run", "deploy", google_cloud_run_service.this.name, "--image", var.image, "--region", var.gcp_region]
    }
  }
}
