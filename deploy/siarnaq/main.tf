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
  count    = var.create_cloud_run ? 1 : 0
  name     = var.name
  location = var.gcp_region

  template {
    spec {
      service_account_name = google_service_account.this.email

      containers {
        image = var.image

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

  lifecycle {
    ignore_changes = [
      template[0].metadata[0].annotations["client.knative.dev/user-image"],
      template[0].metadata[0].annotations["run.googleapis.com/client-name"],
      template[0].metadata[0].annotations["run.googleapis.com/client-version"],
    ]
  }
}

resource "google_cloud_run_service_iam_member" "noauth" {
  count = var.create_cloud_run ? 1 : 0

  location = google_cloud_run_service.this[count.index].location
  project  = google_cloud_run_service.this[count.index].project
  service  = google_cloud_run_service.this[count.index].name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

resource "google_cloudbuild_trigger" "this" {
  count = var.create_cloud_run ? 1 : 0

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
      args = ["build", "--build-arg", "BUILD=$SHORT_SHA", "-t", var.image, "."]
      dir  = "backend"
    }
    step {
      name = "gcr.io/cloud-builders/docker"
      args = ["push", var.image]
    }
    step {
      name = "gcr.io/google-appengine/exec-wrapper"
      args = ["-i", var.image, "-s", "${var.gcp_project}:${var.gcp_region}:${google_sql_database_instance.this.name}", "--", "/env/bin/python", "manage.py", "migrate"]
    }
    step {
      name = "gcr.io/google-appengine/exec-wrapper"
      args = ["-i", var.image, "-s", "${var.gcp_project}:${var.gcp_region}:${google_sql_database_instance.this.name}", "--", "/env/bin/python", "manage.py", "collectstatic", "--verbosity=2", "--no-input"]
    }
    step {
      name = "gcr.io/google.com/cloudsdktool/cloud-sdk"
      entrypoint = "gcloud"
      args = ["run", "deploy", google_cloud_run_service.this[count.index].name, "--image", var.image, "--region", var.gcp_region]
    }
  }
}
